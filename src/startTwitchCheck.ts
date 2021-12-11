import discord, { Client, TextChannel } from "discord.js";
import node_fetch from "node-fetch";
const fetch = node_fetch;
import moment, { Moment } from "moment";

class TwitchManagerC {
    remindedHourly: boolean;
    Client: discord.Client;
    discordChannel: string;
    twitchChannelId: string;
    twitchClientId: string;
    twitchToken: string;
    serverName: string;
    nickname: string;

    constructor(
        Client: discord.Client,
        discordChannelId: string,
        twitchChannelId: string,
        twitchClientId: string,
        twitchToken: string,
        serverName: string
    ) {
        this.remindedHourly = false;
        this.discordChannel = discordChannelId;
        (this.Client = Client), (this.twitchChannelId = twitchChannelId);
        this.twitchClientId = twitchClientId;
        this.twitchToken = twitchToken;
        this.serverName = serverName;
        this.nickname = "unknown";
    }

    public async checkIfStreaming(): Promise<(execTime: Moment) => any> {
        const json = await fetch(
            `https://api.twitch.tv/helix/streams?user_id=${this.twitchChannelId}`,
            {
                headers: { "Client-Id": process.env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${process.env.TWITCH_TOKEN}` },
            }
        );
        const StreamData: any = await json.json();
        if (StreamData.data) {
            StreamData.data = StreamData.data[0]
            this.nickname = StreamData.data.user_name;
            let thumbnail = StreamData.data.thumbnail_url.replace('{width}', '1280')
            thumbnail = thumbnail.replace('{height}', '720')
            return (execTime: Moment) => {
                console.log(`------------------ in cahnnel ${this.discordChannel} ----- ${this.nickname} is streaming`);
                const embeded: discord.MessageEmbed = new discord.MessageEmbed()
                    .setTitle(`${StreamData.data.game_name} : ${StreamData.data.title}`)
                    .setColor(0xfa3c87)
                    .setURL(`https://twitch.tv/${StreamData.data.user_login}`)

                    .setImage(`${thumbnail}`);
                if (this.remindedHourly == false) {
                    this.remindedHourly = true;
                    setTimeout(async () => (this.remindedHourly = false), 1000 * 60 * 60 * 5);
                    try {
                        return (this.Client.channels.cache.get(this.discordChannel) as TextChannel).send({
                            content: `@everyone ${StreamData.data.user_name} teraz streamuje`,
                            embeds: [embeded],
                        });
                    } catch (err) {
                        console.log(err);
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
                    `------ in channel ${this.discordChannel} - ${this.nickname} not streaming`
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
    }
}

export default TwitchManagerC;
