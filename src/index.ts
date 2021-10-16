import discord, { Awaited, GuildMember, Intents, PartialGuildMember, TextChannel } from "discord.js";
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
import Database, { IUser } from "./database";
import { CommandStartedEvent } from "mongodb";
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

app.post("/send", (req: express.Request, res: express.Response) => {
    console.log(req.body);
    // http post body structure
    //{
    //"type": "sendMessage",
    //"channel": "bot",
    //"channelId": 1234567890,
    //"message": "just message"
    //}
    if (req.body.type == "sendMessage" && req.body.channel.length > 0 && req.body.channelId) {
        switch (req.body.channel) {
            case "bot":
                (Client.channels.cache.get(process!.env!.DISCORD_COMMAND_CHANNEL || "") as TextChannel).send(
                    req.body.message
                );
                break;
            case "info-social":
                (Client.channels.cache.get(process.env.DISCORD_CHANNEL || "") as TextChannel).send(req.body.message);
                break;
            case "ogolny":
                (Client.channels.cache.get(process.env.DISCORD_MAIN_CHANNEL || "") as TextChannel).send(
                    req.body.message
                );
                break;
            default:
                (Client.channels.cache.get(req.body.channelId) as TextChannel).send(req.body.message);
                break;
        }
    }
    res.send({ stsus: "working" });
});

Client.on("ready", async () => {
    try {
        //Clock.addStaticReminder({time: new Date(2021, 3, 30, 20, 29, 0, 0), func: () => startTwitchCheck(Client) })
        Clock.addStaticTimeIndependentReminder({
            id: `twitchCheck-${123456789}(future-guild-id)`,
            time: moment("2021-04-06T19:00:00.000"),
            func: () =>
                //TwitchManager.startTwitchCheck(Client),
                console.log("twitch check"),
        });
        Clock.startClock();
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
        throw err;
    }

    const Guild = Client.guilds.cache.get(process.env.DISCORD_SERVER_ID);
    Database.establishConnection(process.env.MONGODB_STRING)
        .catch((err) => console.log(err))
        .then(() => {
            // Database.insertNewUser({
            //     name: "test1",
            //     ClientId: "21341234234",
            //     rolesIds: ["312312"],
            //     rolesNames: ["eeee makarena"],
            // });
            // Database.getUser(
            //     {
            //         name: "test1",
            //         ClientId: "21341234234",
            //         rolesIds: ["312312"],
            //         rolesNames: ["eeee makarena"],
            //     },
            //     Guild.id
            // );
            // Database.validateCollection(Guild.id).then((name) => console.log(""));
        });
    let commands = null;
    if (Guild) {
        commands = Guild.commands;
    } else commands = Client.application.commands;

    console.log(discord.Constants.ApplicationCommandOptionTypes.STRING);

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
        name: "show-‎list",
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
                description: "id of a twitch channel (instructions on github)",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: "twitch-client-id",
                description: "id of a twitch user (instructions on github)",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: "twitch-token",
                description: "token for twitch API veryfication (instructions on github)",
                required: true,
                type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ],
        description: "ads listener for custom twitch streamer",
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
        case "play":
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
        case `add-twitch-user`:
            const discordChannel = interaction.options.getChannel("channel");
            const twitchChannelId = interaction.options.getString("twitch-channel-id");
            const twitchClientId = interaction.options.getString("twitch-client-id");
            const twitchToken = interaction.options.getString("twitch-token");
            TwitchUserListeners.set(
                twitchClientId,
                new twitchManagerC(
                    Client,
                    discordChannel.id,
                    twitchChannelId,
                    twitchClientId,
                    twitchToken,
                    interaction.guild.name
                )
            );
            Clock.addStaticTimeIndependentReminder({
                id: `user-twitch-check-${twitchChannelId}`,
                time: moment(),
                func: () => TwitchUserListeners.get(twitchClientId).checkIfStreaming(),
            });
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
    console.log("welcoming user");
    welcomeUser(member);
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
    Database.getUser(dataUser.ClientId, member.guild.id).then((databaseUser) => {
        databaseUser.rolesIds.map((roleId: string) => {
            member.roles.add(roleId);
        });
    });
});

Client.on("messageCreate", (message: discord.Message): Awaited<any> => {
    //console.log(message.channel.id)
    const matches = [/kiedy/, /której/, /ktorej/, /kotrej/];
    if (matchArray(message.content, matches) && message.guild.id == process.env.DISCORD_SERVER_ID) {
        console.log(matchArray(message.content, matches));
        console.log("kieyd live message send");
        message.channel.send(`\`\`\`json${process.env.REMINDER_MESSAGE}\`\`\``);
    }
    if (message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes("BOT")) {
        const regex = message.content.match(/BOT (.*)/);
        if (regex != null) {
            const command = regex[1];
            switch (true) {
                case command.includes("save users"):
                    userDB.makeUserList(message);
                    break;
                case command.includes("punish"):
                    const time = command.split(" ");
                    //lastJudgment.punishByRole(Client, message, time[time.length - 1])
                    // lastJudgment.punishInit(Client, message, time[time.length - 1]);
                    //Clock.addDynamicReminder({time: new Date(Date.now() + parseFloat(time[time.length - 1]) * 1000 * 60), func: () => console.log('punish that bitch') })
                    break;
                case command.includes("play"):
                    break;
                case command.includes("skip"):
                    ytMeneger.skipSong(message);
                    break;
                case command.includes("show list"):
                    ytMeneger.displayQuerry(message);
                    break;
                case command.includes("fix connection"):
                    ytMeneger.fixConnection(message);
                    break;
                case command.includes("slavery mode"):
                    let userChanged: number = 0;
                    if (message.guild.me.permissions.has("MANAGE_NICKNAMES") == false)
                        return message.channel.send("brak uprawnień do zmiany nicków");
                    // message.guild.members
                    //     .fetch()
                    //     .then((members: discord.GuildMemberManager) => {
                    //         members.forEach((member: discord.GuildMember, key: string) => {
                    //             if (
                    //                 !member.roles.cache.find((r) => r.name == process.env.SPECIALROLE) &&
                    //                 member.roles.highest.position < message.guild.me.roles.highest.position &&
                    //                 member.id != process.env.OWNER_ID
                    //             ) {
                    //                 userChanged += 1;
                    //                 member.setNickname(`niewolnik ${key}`);
                    //             }
                    //         });
                    //     })
                    //     .finally(() => {
                    //         message.channel.send(`changed ${userChanged} user nicknames`);
                    //     });
                    break;
                // case command.includes("clone server"):
                //     const serverId: string = command.split(" ")[2];
                //     cloneServer(serverId, message, Client);
                //     break;
                /*case command.includes("clear server"):
                    const givenServerId: string = command.split(" ")[2];
                    Client.guilds.fetch(givenServerId).then((targetGuild: discord.Guild) => {
                        // const deletingChanelsPromise = targetGuild.channels.cache.map((channel) =>
                        // channel
                        // .delete()
                        // .then((afterChannel) => console.log(`deleted ${afterChannel.id} channel`))
                        // .catch((err) => console.log(err))
                        // );

                        const deletingrolesPromise = targetGuild.roles.cache.map(async (role) => {
                            console.log(process.env.BOT_NAME, role.name);
                            return (
                                role.name != process.env.BOT_NAME &&
                                role.name != "@everyone" &&
                                role
                                    .delete()
                                    .then((afterRole) => console.log(`deleted ${afterRole.name} role`))
                                    .catch((err) => console.log(err))
                            );
                        });

                        // Promise.all(deletingChanelsPromise)
                        // .then(() => {
                        // console.log(`deleted all channels`);
                        // })
                        // .catch((err) => console.log(err));
                        Promise.all(deletingrolesPromise)
                            .then(() => console.log("deleted all roles"))

                            .catch((err) => console.log(err));
                    });
                    break;
                */
                case command.includes("help"):
                    const embeded = new discord.MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("Command list")
                        .setDescription("Wyświetlenie wszelkich komend jakie są w miodku")
                        .addFields(
                            {
                                name: "BOT save users",
                                value: "Tworzy listę wszystkich ról użytkowników którzy je posiadają i zapisuje je na serwerze by potem bot mógł je dodać po tym jak osoba wyjdzie i wejdzie",
                            },
                            {
                                name: "BOT punish @user1 @user2 time+format",
                                value: "dodaje rolę karną dla pingowanych użytkowników na określony czas\t formaty:\t y- lata\t M-miesiąc\tw-tygodnie\td-dni\th-godziny\tm-minuty\ts-sekundy\tpolecane jest dawanie kar na więcej niż 2 minuty ze względu na timer który sprawdza czas co mitutę, więc dawanie na mniej spowoduje ukaranie użytkownika na zawsze",
                            },
                            {
                                name: "BOT play youtube_link/custom_words",
                                value: "Dołącza do kanału na którym jest osoba która wpisała komendę i puszcza muzykę w czasie rzeczywistym. w przypadku odtwarzania już jakieś muzyki miodek tworzy listę i dodaję daną muzykę do kolejki by ją później puścić.",
                            },
                            {
                                name: "BOT skip",
                                value: "W przypadku odtwarzania muzyki na kanale głosowym komenda pomiją odtwarzaną muzykę i w przypadku zaistnienia kolejnej w kolejce, puszcza ją",
                            },
                            {
                                name: "BOT show list",
                                value: "Pokazuje listę piosenek które mają być puszczone na kanale głosowym.",
                            },
                            {
                                name: "BOT fix connection",
                                value: "Ponieważ biblioteka discorda jest ułomna i nie umie poprawnie wykryć kiedy bot jest połączony z kanałem głosowym, komenda ta w przypadku zaistnienia błędu przebywania bota na innym kanale programowo wyrzuca bota z danego kanału i czyści kolejkę muzyk.",
                            }
                        );
                    message.channel.send({
                        embeds: [embeded],
                    });
                    break;
            }
        }
    }
});

console.log("działa");

Client.login(process.env.TOKEN);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
