import discord from 'discord.js'
import dotenv from 'dotenv'
import { makeUserList } from './userList.js'
import { startTwitchCheck } from './startTwitchCheck.js'
import { welcomeUser } from './welcomeUser.js'
import { rolePunish } from './rolePunichment.js'
import fs from 'fs'
dotenv.config()

const Client = new discord.Client()
const Guild = new discord.Guild(Client)

const getFileJson = () => {
    return JSON.parse(fs.readFileSync('./roles.json', 'utf-8'))
}

Client.on('ready', async () => {
	startTwitchCheck(Client)
    try {
    Client.channels.cache.get(process.env.DISCORD_CHANNEL).send('dzialam')
    } catch(err) { throw err }
})

Client.on('message', message => {
    console.log(message.channel.id)
    if(message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes('BOT') ){
        const regex = message.content.match(/BOT (.*)/)
        if(regex != null){
            const command = regex[1]
            switch(true){
                case command.includes('save users'):
		            makeUserList(message, Client)
                    break
                case command.includes('punish'):
                    const time = command.split(' ')
                    rolePunish(Client, message.mentions.users, time[time.length -1])
                    break
            }
        }
    }

})

Client.on('guildMemberUpdate', member => {
// niby dziala na kazda zmiane roi, ale tez zmianie pseudonimu jak i usuniecie albo dodanie uzytkownika
	makeUserList(member, Client)
})

Client.on('guildMemberAdd', member => {
    welcomeUser(member)
    // member.roles.add(member.guild.roles.cache.find(r => r.name == 'debil'))

    // user roles validation and assignment
    getFileJson().map( o => {
        if(typeof o.clientId != 'undefined' && o.clientId)
        if(o.clientId == member.user.id){
            o.roles.map(role => member.roles.add(member.guild.roles.cache.find(r => r.name == role)))
        }
    } )
});


console.log('działa')

Client.login(process.env.TOKEN)
