import discord from 'discord.js'
import dotenv from 'dotenv'
import node_fetch from 'node-fetch'
const fetch = node_fetch
import fs from 'fs'
dotenv.config()

const Client = new discord.Client()
const Guild = new discord.Guild(Client)

Client.on('ready', async () => {
    console.log('bot włączony')
    // Client.channels.cache.get('748643741874782318').send('Dzień dobry. Od dziś będę pomagał w śledz... znaczy się pomaganiu mihalxowi w wypisywaniu kiedy będzie streamować')
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
        // embeded.setTitle(`@everyone ${process.env.TWITCH_USERNAME} aka ciota teraz streamuje`)
        // // embeded.url(`https://www.twitch.tv/mihalx`)
        // embeded.video = {url: 'https://www.twitch.tv/mihalx', height: 17, width: 17}
        // // embeded.video({url: 'https://www.twitch.tv/mihalx', height: 17, width: 17})
        if(StreamData.stream && isStreaming == false){
            console.log(StreamData.stream)
            isStreaming = true
            const embeded = await new discord.MessageEmbed()
            .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`).setColor(0xFA3C87)    
            .setURL(`${StreamData.stream.channel.url}`)
            .setImage(`${StreamData.stream.preview.large}`);
            Client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`, embeded)
        } else if(!StreamData.stream && isStreaming == true) {
            isStreaming = false
            //clearInform()
        }
    }, 1000 * 60)
    Client.channels.cache.get(process.env.DISCORD_CHANNEL).send('dzialam')
})

Client.on('message', message => {
    console.log(message.channel.id)
    if(message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes('BOT') ){
        const regex = message.content.match(/BOT (.*)/)
        if(regex != null){
            const command = regex[1]
            let users = []
            let roles = []
            switch(command){
                case 'list users':
                    const cache = Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach( user => {
                        users = [...users, user]
                    } )
                    // console.log(users)
                    const chache2 = Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).roles.cache.forEach(role => {
                        roles = [...roles, {id: role.id, name: role.name}]
                    })
                    console.log(roles)
                    console.log('--------------------------------------')
                    console.log(users[0]._roles)
                    let json = []
                    users.map( user => {
                        console.log(user.user)
                        json = [...json, {name: user.user.username, clientId: user.user.id, roles: roles.filter( role => {
                            console.log(role)
                            if(user._roles.includes(role.id))
                                return role.name
                        } ).map(o => o.name), user: user._roles}]
                    } )
                    json = [...json, roles]
                    console.log(json)
                    const data = JSON.stringify(json)
                    fs.writeFile('roles.json', data, err => {
                        if(err)
                            console.log(err)
                    })
            }
        }
    }

})

console.log('działa')

Client.login(process.env.TOKEN)
