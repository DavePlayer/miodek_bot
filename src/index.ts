import discord, { GuildMember, Intents, MessageEmbed, PartialGuildMember, TextChannel } from "discord.js";
import express from "express";
import "@babel/polyfill";
import dotenv from "dotenv";
import userDB, { INormalUser } from "./userList";
import twitchManagerC from "./startTwitchCheck";
import { welcomeUser } from "./welcomeUser";
import lastJudgment from "./rolePunichment";
import fs from "fs";
import ytMeneger from "./ytMusic";
import { user } from "./interfaces";
import Clock from "./clock";
import moment from "moment";
import Database, { ITwitchUser, IUser } from "./database";
import { CommandStartedEvent } from "mongodb";
import TwitchManagerC from "./startTwitchCheck";
import node_fetch from "node-fetch";
const fetch = node_fetch;
// import { cloneServer } from "./cloneServer";

dotenv.config();

export const Client = new discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});
ytMeneger.setClient(Client);
const app = express();
app.use(express.json() as express.RequestHandler);

const getFileJson = () => {
    return JSON.parse(fs.readFileSync("./roles.json", "utf-8"));
};

const TwitchUserListeners = new Map<string, twitchManagerC>([]);

export const GetTwitchAppOauth = async () => {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: "POST" })
    const resToken = await res.json()
    return resToken.access_token
}


Client.on("ready", async () => {
    console.log(`                                                                        
######   ##   #####  #      #  ####  # ######    #    # #    # # ###### 
    #   #  #  #    # #      # #    # # #         ##  ## ##   # # #      
   #   #    # #####  #      # #      # #####     # ## # # #  # # #####  
  #    ###### #    # #      # #      # #         #    # #  # # # #      
 #     #    # #    # # #    # #    # # #         #    # #   ## # #      
###### #    # #####  #  ####   ####  # ######    #    # #    # # ###### 
    `);
    app.post("/send", async (req: express.Request, res: express.Response) => {
        console.log(req.body);
        // http post body structure
        //{
        //"type": "sendMessage",
        //"channelId": 1234567890,
        //"message": "just message"
        //}
        if (req.body.type == "sendMessage" && req.body.channel.length > 0 && req.body.channelId) {
            const channel = await Client.channels.fetch(`${req.body.channelId}`) as TextChannel
            channel.send(req.body.message);
        }
        res.send({ stsus: "working" });
    });
    try {
        // start function execution clock
        Clock.startClock();

        // set Presence
        Client.user?.setPresence({
            status: "online", //You can show online, idle....
            activities: [
                {
                    name: process.env.STATUS, //The message shown
                    type: "PLAYING", //PLAYING: WATCHING: LISTENING: STREAMING:
                },
            ],
        });
    } catch (err) {
        console.log(err);
    }

    // set twitch token

    Database.establishConnection(process.env.MONGODB_STRING)
        .catch((err) => console.log(err))
        .then(async () => {
            // get twitch users and initialize stream listening
            try {
                process.env.TWITCH_TOKEN = await GetTwitchAppOauth()
                const users = await Database.getTwitchUsers();
                console.log(users)
                users.map((user) => {
                    TwitchUserListeners.set(
                        user.twitchChannelId + "-in-" + user.discordChannelId,
                        new TwitchManagerC(
                            Client,
                            user.discordChannelId,
                            user.twitchChannelId,
                            user.twitchClientId,
                            user.twitchToken,
                            user.serverName
                        )
                    );
                    Clock.addStaticTimeIndependentReminder({
                        id: `user-twitch-check-${user.twitchChannelId}`,
                        time: moment(),
                        func: () =>
                            TwitchUserListeners.get(
                                user.twitchChannelId + "-in-" + user.discordChannelId
                            ).checkIfStreaming(),
                    });
                });
            } catch (error) {
                console.log(error);
            }
        });
    let Guild: any = null;
    // Guild = await Client.guilds.cache.get("898977782321795092");
    let commands = null;
    if (Guild) {
        commands = Guild.commands;
    } else commands = Client.application.commands;

    commands.create({
        name: "test",
        description: "testing command",
    });
    commands.create({
        name: "play-yt-music",
        description: "Play YouTube Music from link or custom words",
        options: [
            {
                name: "name",
                description: "either YT link or custom search words",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
    });
    commands.create({
        name: "show-list",
        description: "Show YouTube music querry",
    });
    commands.create({
        name: "skip",
        description: "skip YouTube music",
    });
    commands.create({
        name: "fix-connection",
        description: "clear querry and destroy bot channel connection",
    });
    commands.create({
        name: "punish",
        options: [
            {
                name: "role",
                description: "punishment role which is going to be given",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.ROLE,
            },
            {
                name: "user",
                description: "user which should be punished",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.USER,
            },
            {
                name: "time",
                description: "time after which user should be released [liczba + format czasu]",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
        description: "adds custom punishment role to user with timeout (will be deleted after given time)",
    });
    commands.create({
        name: "add-twitch-user",
        options: [
            {
                name: "channel",
                description: "Channel on which message should be sent",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.CHANNEL,
            },
            {
                name: "twitch-channel-id",
                description: "ID of a twitch channel (/get-twitch-data)",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
        description: "ads listener for custom twitch streamer",
    });
    commands.create({
        name: "get-twitch-data",
        options: [
            {
                name: "login",
                description: "twitch user login",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
        description: "get user data from twitch (necessary for adding stream listening)",
    });
});

function matchArray(message: string, matcher: Array<RegExp>): boolean {
    return matcher.some((expr) => {
        if (message.match(expr) && message.includes("live")) {
            return true;
        }
    });
}

Client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    switch (interaction.commandName) {
        case "test":
            interaction.reply({
                content: "test is succesfull, now go and die",
                // ephemeral: true,
                // ^ only you can see this
            });
            break;
        case "play-yt-music":
            const link = interaction.options.getString("name");
            ytMeneger.playMusic(interaction, link);
            break;
        case "show-list":
            ytMeneger.displayQuerry(interaction);
            break;
        case "skip":
            ytMeneger.skipSong(interaction);
            break;
        case "fix-connection":
            ytMeneger.fixConnection(interaction);
            break;
        case "punish":
            const punishmentRole = interaction.options.getRole("role");
            const user = interaction.options.getMember("user");
            const time = interaction.options.getString("time");
            await lastJudgment.punishInit(interaction, punishmentRole, user, time);
            // interaction.reply(`works`);
            break;
        case `get-twitch-data`:
            try {
                const nickname = interaction.options.getString("login");
                const json = await fetch(`https://api.twitch.tv/helix/users?login=${nickname}`, {
                    headers: {
                        "Client-Id": process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
                    },
                });
                const StreamData: any = await json.json();
                console.log(StreamData)
                if (StreamData.data && StreamData.data.length > 0) {
                    const embeds = StreamData.data.map((user: any) => {
                        return new MessageEmbed({
                            color: "#f00",
                            title: `user info`,
                        })
                            .setAuthor(user.display_name, user.profile_image_url)
                            .setDescription(`id: ${user.id}`)
                            .addField(`description:`, user.description || "null");
                    });
                    // interaction.reply(`\`\`\`json\n ${JSON.stringify(StreamData.users, null, 2)} \n\`\`\``);
                    interaction.reply({
                        embeds: embeds,
                    });
                } else {
                    interaction.reply(`no user found`);
                }
            } catch (error) {
                console.log(error);
                interaction.reply(`sth went wrong`);
            }
            break;
        case `add-twitch-user`:
            const discordChannelId = interaction.options.getChannel("channel").id;
            const twitchChannelId = interaction.options.getString("twitch-channel-id");
            const twitchClientId = process.env.TWITCH_CLIENT_ID;
            const twitchToken = process.env.TWITCH_TOKEN;
            const serverName = interaction.guild.name;

            // check if user is not already in stream listener list
            console.log(twitchChannelId);
            if (TwitchUserListeners.has(twitchChannelId)) {
                interaction.reply(`user is already spied on`);
                break;
            }

            //check if api keys are ok
            try {
                const json = await fetch(`https://api.twitch.tv/helix/streams?user_id=${twitchChannelId}`, {
                    headers: {
                        "Client-Id": process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
                    },
                });
                const StreamData: any = await json.json();
                if (StreamData.error) {
                    interaction.reply(`error: ${StreamData.message}`);
                    break;
                }
            } catch (error) {
                throw error;
            }

            // add twitchUserListener to list (for future checkout)
            TwitchUserListeners.set(
                twitchChannelId + "-in-" + discordChannelId,
                new twitchManagerC(
                    Client,
                    discordChannelId,
                    twitchChannelId,
                    twitchClientId,
                    twitchToken,
                    serverName,
                    interaction
                )
            );

            // add check user stream status function to clock for listening
            Clock.addStaticTimeIndependentReminder({
                id: `user-twitch-check-${twitchChannelId}+${serverName}`,
                time: moment(),
                func: () => TwitchUserListeners.get(twitchChannelId + "-in-" + discordChannelId).checkIfStreaming(),
            });

            //save user in database
            Database.insertTwitchUser({
                discordChannelId,
                twitchChannelId,
                twitchClientId,
                twitchToken,
                serverName,
            });

            // give back status answer
            interaction.reply({
                content: "added user for stream reminder listening",
                ephemeral: true,
            });
            break;
    }
});

Client.on("guildMemberUpdate", (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
    // niby dziala na kazda zmiane roi, ale tez zmianie pseudonimu jak i usuniecie albo dodanie uzytkownika
    userDB.updateUserList(newMember as INormalUser);
});

Client.on("guildMemberAdd", (member: GuildMember | PartialGuildMember) => {
    // console.log("welcoming user");
    // welcomeUser(member);
    // member.roles.add(member.guild.roles.cache.find(r => r.name == 'debil'))

    // user roles validation and assignment
    // getFileJson().users.map((o: user) => {
    //     if (typeof o.clientId != "undefined" && o.clientId)
    //         if (o.clientId == member.user?.id) {
    //             o.roles.map((role: string) => {
    //                 const roleObj: discord.Role = member.guild.roles.cache.find((r: discord.Role) => r.name == role);
    //                 if (!member.manageable || !roleObj.editable) {
    //                     console.log(
    //                         `cannot manipulate role assigned for ${member.user.username}\t Here's his saved role: ${role}`
    //                     );
    //                     (Client.channels.cache.get(process.env.DISCORD_COMMAND_CHANNEL) as TextChannel).send(
    //                         `Cannot add role ${role} to user: ${member.user.username}`
    //                     );
    //                 } else {
    //                     member.roles.add(roleObj);
    //                 }
    //             });
    //         }
    // });
    const dataUser: IUser = {
        name: member.user.username,
        ClientId: member.user.id,
        rolesIds: (member as INormalUser)._roles,
    };
    Database.getUser(dataUser.ClientId, member.guild.id)
        .then((databaseUser) => {
            databaseUser.rolesIds.map((roleId: string) => {
                member.roles.add(roleId);
            });
        })
        .catch((err) => console.log(err));
});

Client.on("messageCreate", (message: discord.Message): Awaited<any> => {
    //console.log(message.channel.id)
    const matches = [/kiedy/, /której/, /ktorej/, /kotrej/];
    if (matchArray(message.content, matches) && message.guild.id == process.env.DISCORD_SERVER_ID) {
        console.log(matchArray(message.content, matches));
        console.log("kieyd live message send");
        message.channel.send(`\`\`\`json${process.env.REMINDER_MESSAGE}\`\`\``);
    }
});

console.log("działa");

Client.login(process.env.TOKEN);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
