import node_fetch from "node-fetch";
import discord, {Client, TextChannel} from "discord.js";
const fetch = node_fetch;

export const startTwitchCheck = (Client: Client) => {
    console.log("checking twitch status");
    setTimeout(async () => {
        const json = await fetch(
            `https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}?client_id=${process.env.TWITCH_CLIENT_ID}&token=${process.env.TWITCH_TOKEN}&api_version=5`
        );
        const StreamData = await json.json();
        if (StreamData.stream) {
            const embeded = new discord.MessageEmbed()
                .setTitle(
                    `${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`
                )
                .setColor(0xfa3c87)
                .setURL(`${StreamData.stream.channel.url}`)

                .setImage(`${StreamData.stream.preview.large}`);
            (Client.channels.cache
                .get(process.env.DISCORD_CHANNEL as string) as TextChannel)
                .send(
                    `@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`,
                    embeded
                );
        } else {
            (Client.channels.cache
                .get(process.env.DISCORD_CHANNEL as string) as TextChannel)
                .send(
                    `@everyone ${process.env.TWITCH_USERNAME} dziś nie streamuje`,
                );
        }
    }, 1000);
};
