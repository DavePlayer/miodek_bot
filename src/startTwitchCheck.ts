import discord, { Client, TextChannel } from "discord.js";
import node_fetch from "node-fetch";
const fetch = node_fetch;
import moment, { Moment } from "moment";

class TwitchManagerC {
    remindedHourly: boolean;

    constructor() {
        this.remindedHourly = false;
    }

    public async startTwitchCheck(Client: Client): Promise<(execTime: Moment) => Promise<any>> {
        console.log("checking twitch status");
        const json = await fetch(
            `https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}?client_id=${process.env.TWITCH_CLIENT_ID}&token=${process.env.TWITCH_TOKEN}&api_version=5`
        );
        const StreamData: any = await json.json();
        if (StreamData.stream) {
            const embeded: discord.MessageEmbed = new discord.MessageEmbed()
                .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`)
                .setColor(0xfa3c87)
                .setURL(`${StreamData.stream.channel.url}`)

                .setImage(`${StreamData.stream.preview.large}`);
            console.log(`${process.env.TWITCH_USERNAME} is streaming`);
            return (execTime: Moment) => {
                if (this.remindedHourly == false) {
                    this.remindedHourly = true;
                    setTimeout(async () => (this.remindedHourly = false), 1000 * 60 * 60 * 5);
                    try {
                        return (Client.channels.cache.get(process.env.DISCORD_CHANNEL as string) as TextChannel).send({
                            content: `@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`,
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
            console.log(`${process.env.TWITCH_USERNAME} is not streaming`);
            return (execTime: Moment) => {
                const time = moment();
                console.log(execTime.hour(), time.hour(), execTime.minute(), time.minute(), `------ not streaming`);
                if (execTime.hour() == time.hour() && execTime.minute() == time.minute())
                    try {
                        return (Client.channels.cache.get(process.env.DISCORD_CHANNEL as string) as TextChannel).send(
                            `@everyone ${process.env.TWITCH_USERNAME} dziś nie streamuje`
                        );
                    } catch {
                        (err: Error) => console.log(err);
                    }
            };
        }
    }
}

export const TwitchManager = new TwitchManagerC();
