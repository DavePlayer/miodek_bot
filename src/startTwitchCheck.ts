import discord, { Client, TextChannel } from "discord.js";
import node_fetch from "node-fetch";
const fetch = node_fetch;
import moment, { Moment } from "moment";
import { GetTwitchAppOauth } from "./index";

class TwitchManagerC {
    remindedHourly: boolean;
    Client: discord.Client;
    discordChannel: string;
    twitchChannelId: string;
    twitchClientId: string;
    twitchToken: string;
    serverName: string;
    nickname: string;
    interaction: discord.CommandInteraction;

    constructor(
        Client: discord.Client,
        discordChannelId: string,
        twitchChannelId: string,
        twitchClientId: string,
        twitchToken: string,
        serverName: string,
        interaction?: discord.CommandInteraction
    ) {
        this.remindedHourly = false;
        this.discordChannel = discordChannelId;
        (this.Client = Client), (this.twitchChannelId = twitchChannelId);
        this.twitchClientId = twitchClientId;
        this.twitchToken = twitchToken;
        this.serverName = serverName;
        this.nickname = "unknown";
        this.interaction = interaction || null;
    }

    public async checkIfStreaming(): Promise<(execTime: Moment) => any> {
        try {
            const json = await fetch(`https://api.twitch.tv/helix/streams?user_id=${this.twitchChannelId}`, {
                headers: { "Client-Id": process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${process.env.TWITCH_TOKEN}` },
            });
            const userJson = await fetch(`https://api.twitch.tv/helix/users?id=${this.twitchChannelId}`, {
                headers: { "Client-Id": process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${process.env.TWITCH_TOKEN}` },
            });
            if (json.status != 200 || userJson.status != 200) {
                throw "Twitch again killed my bot, startTwitchCheck if any of data status is not 200"
            }
            this.nickname = ((await userJson.json()) as any).data[0].display_name;
            const StreamData: any = await json.json();
            if (StreamData.data && StreamData.data.length > 0) {
                StreamData.data = StreamData.data[0];
                // this.nickname = StreamData.data.user_name;
                let thumbnail = StreamData.data.thumbnail_url.replace("{width}", "1280");
                thumbnail = thumbnail.replace("{height}", "720");
                return async (execTime: Moment) => {
                    console.log(`---------------- on ${this.serverName} server ----- ${this.nickname} is streaming`);
                    const embeded: discord.MessageEmbed = new discord.MessageEmbed()
                        .setTitle(`${StreamData.data.game_name} : ${StreamData.data.title}`)
                        .setColor(0xfa3c87)
                        .setURL(`https://twitch.tv/${StreamData.data.user_login}`)

                        .setImage(`${thumbnail}`);
                    if (this.remindedHourly == false) {
                        this.remindedHourly = true;
                        setTimeout(async () => (this.remindedHourly = false), 1000 * 60 * 60 * 5);
                        try {
                            return ((await this.Client.channels.cache.get(this.discordChannel)) as TextChannel).send({
                                content: `@everyone ${StreamData.data.user_name} teraz streamuje`,
                                embeds: [embeded],
                            });
                        } catch (err) {
                            console.log(err);
                            this.interaction != null &&
                                this.interaction.channel.send(
                                    `error accoured: ${err}\n\n Most likely that you chose category instead of channel. ask moderator to fix it`
                                );
                        }
                    }
                };
            } else {
                return (execTime: Moment) => {
                    const time = moment();
                    console.log(
                        execTime.hour(),
                        time.hour(),
                        execTime.minute(),
                        time.minute(),
                        `------ in ${this.serverName} server - ${this.nickname} not streaming`
                    );
                    // if (execTime.hour() == time.hour() && execTime.minute() == time.minute())
                    //     try {
                    //         return (Client.channels.cache.get(process.env.DISCORD_CHANNEL as string) as TextChannel).send(
                    //             `@everyone ${process.env.TWITCH_USERNAME} dziś nie streamuje`
                    //         );
                    //     } catch {
                    //         (err: Error) => console.log(err);
                    //     }
                    return () =>
                        console.log(`client ${this.twitchChannelId} from ${this.serverName} server is not streaming`);
                };
            }
        } catch (error) {
            process.env.TWITCH_TOKEN = await GetTwitchAppOauth()
            console.log(error);
        }
    }
}

export default TwitchManagerC;
