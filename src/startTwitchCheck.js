import node_fetch from 'node-fetch'
const fetch = node_fetch

export const startTwitchCheck = async () => {
    console.log('checking twitch status')
    // Client.channels.cache.get('748643741874782318').send('Dzień dobry. Od dziś będę pomagał w śledz... znaczy się pomaganiu mihalxowi w wypisywaniu kiedy będzie streamować')
    let isStreaming = false
    let didInform = false
    const clearInform = async () => {
        setTimeout(() => {
            didInform = false
        }, 1200 * 12)
    }
    setInterval( async () => {
        const json = await fetch(`https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}?client_id=${process.env.TWITCH_CLIENT_ID}&token=${process.env.TWITCH_TOKEN}&api_version=5`)
        const StreamData = await json.json()
        // embeded.setTitle(`@everyone ${process.env.TWITCH_USERNAME} aka ciota teraz streamuje`)
        // // embeded.url(`https://www.twitch.tv/mihalx`)
        // embeded.video = {url: 'https://www.twitch.tv/mihalx', height: 17, width: 17}
        // // embeded.video({url: 'https://www.twitch.tv/mihalx', height: 17, width: 17})
        if(StreamData.stream && isStreaming == false){
            console.log(StreamData.stream)
            isStreaming = true
            const embeded = new discord.MessageEmbed()
            .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`).setColor(0xFA3C87)    
            .setURL(`${StreamData.stream.channel.url}`)

            .setImage(`${StreamData.stream.preview.large}`);
            Client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`, embeded)
        } else if(!StreamData.stream && isStreaming == true) {
            isStreaming = false
            //clearInform()
        }
    }, 1000 * 60)
}
