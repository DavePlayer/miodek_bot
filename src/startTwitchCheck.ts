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

    constructor(
        Client: discord.Client,
        discordChannel: string,
        twitchChannelId: string,
        twitchClientId: string,
        twitchToken: string,
        serverName: string
    ) {
        this.remindedHourly = false;
        this.discordChannel = discordChannel;
        (this.Client = Client), (this.twitchChannelId = twitchChannelId);
        this.twitchClientId = twitchClientId;
        this.twitchToken = twitchToken;
        this.serverName = serverName;
    }

    public async checkIfStreaming(): Promise<(execTime: Moment) => any> {
        const json = await fetch(
            `https://api.twitch.tv/kraken/streams/${this.twitchChannelId}?client_id=${this.twitchClientId}&token=${this.twitchToken}&api_version=5`
        );
        const StreamData: any = await json.json();
        if (StreamData.stream) {
            console.log(`${process.env.TWITCH_USERNAME} is streaming`);
            return (execTime: Moment) => {
                const embeded: discord.MessageEmbed = new discord.MessageEmbed()
                    .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`)
                    .setColor(0xfa3c87)
                    .setURL(`${StreamData.stream.channel.url}`)

                    .setImage(`${StreamData.stream.preview.large}`);
                if (this.remindedHourly == false) {
                    this.remindedHourly = true;
                    setTimeout(async () => (this.remindedHourly = false), 1000 * 60 * 60 * 5);
                    try {
                        return (this.Client.channels.cache.get(this.discordChannel) as TextChannel).send({
                            content: `@everyone ${StreamData.stream.channel.display_name} teraz streamuje`,
                            embeds: [embeded],
                        });
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    console.log(`checked streaming. Waiting still 5H interval`);
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
                    `------${this.twitchClientId} not streaming`
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
