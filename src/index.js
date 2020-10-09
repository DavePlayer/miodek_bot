import discord from 'discord.js'
import dotenv from 'dotenv'
import node_fetch from 'node-fetch'
const fetch = node_fetch
dotenv.config()

const Client = new discord.Client()

Client.on('ready', async () => {
    console.log('bot włączony')
    Client.channels.cache.get('748643741874782318').send('Dzień dobry. Od dziś będę pomagał w śledz... znaczy się pomaganiu mihalxowi w wypisywaniu kiedy będzie streamować')
    let isStreaming = false
    let didInform = false
    const clearInform = async () => {
        await setTimeout(() => {
            didInform = false
        }, 1200 * 12)
    }
    await setInterval( async () => {
        const json = await fetch(`https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}?client_id=${process.env.TWITCH_CLIENT_ID}&token=${process.env.TWITCH_TOKEN}&api_version=5`)
        const StreamData = await json.json()
        const embeded = new discord.MessageEmbed()
        .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`).setColor(0xFA3C87)    
        .setURL(`${StreamData.stream.channel.url}`)
        .setImage(`${StreamData.stream.preview.large}`);
        // embeded.setTitle(`@everyone ${process.env.TWITCH_USERNAME} aka ciota teraz streamuje`)
        // // embeded.url(`https://www.twitch.tv/mihalx`)
        // embeded.video = {url: 'https://www.twitch.tv/mihalx', height: 17, width: 17}
        // // embeded.video({url: 'https://www.twitch.tv/mihalx', height: 17, width: 17})
        if(StreamData.stream && isStreaming == false){
            console.log(StreamData.stream)
            isStreaming = true
            Client.channels.cache.get('748643741874782318').send(`@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`, embeded)
        } else if(!StreamData.stream && isStreaming == true) {
            isStreaming = false
            //clearInform()
        }
    }, 5000)
})

console.log('działa')

Client.login(process.env.TOKEN)
