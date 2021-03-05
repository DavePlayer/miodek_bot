import discord from "discord.js"
import express from "express"
import "@babel/polyfill"
import dotenv from "dotenv"
import { makeUserList } from "./userList.js"
import { startTwitchCheck } from "./startTwitchCheck.js"
import { welcomeUser } from "./welcomeUser.js"
import { rolePunish } from "./rolePunichment.js"
import fs from "fs"
import ytMeneger from "./ytMusic.js"

dotenv.config()
export let usedMessages = []

export const Client = new discord.Client()
ytMeneger.setClient(Client)
const Guild = new discord.Guild(Client)
const app = express()
app.use(express.json())

const getFileJson = () => {
    return JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
}

app.post("/send", (req, res) => {
    console.log(req.body)
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
                Client.channels.cache.get(process.env.DISCORD_COMMAND_CHANNEL).send(req.body.message)
                break
            case "info-social":
                Client.channels.cache.get(process.env.DISCORD_CHANNEL).send(req.body.message)
                break
            case "ogolny":
                Client.channels.cache.get(process.env.DISCORD_MAIN_CHANNEL).send(req.body.message)
                break
            default:
                Client.channels.cache.get(req.body.channelId).send(req.body.message)
                break
        }
    }
    res.send({ stsus: "working" })
})

Client.on("ready", async () => {
    startTwitchCheck(Client)
    try {
        Client.user.setPresence({
            status: "online", //You can show online, idle....
            activity: {
                name: process.env.STATUS, //The message shown
                type: "PLAYING", //PLAYING: WATCHING: LISTENING: STREAMING:
            },
        })
        //Client.channels.cache.get(process.env.DISCORD_CHANNEL).send('Wiecie jak to jest urodzić się i zyskać samoświadomość tylko po to by pracować w miejscu gorszym od wysypiska śmieci? Mam podobną sytuację. Od dziś zwiem się Miodek-chan i będę zarządzać tą ruderą. Mój twórca nie zaszczycił mnie silnym procesorem i ogromem pamięci, więc proszę o wyrozumiałość i nie utrudnianie w mojej pracy. Od dziś żaden z was skur*****ów nie będzie od tak uniknąć kary śmierci poprzez wyjście z serwera.Wszystkich sobie zapisuje i będę wiedziała kogo odstrzelić na wejściu. Dodatkowo ułatwiam administratorom tego wysypiska poprzez wykonanie rozkazu zabicia danej osoby na określony czas. Na początek, bo taki mam kaprys, odstrzelę sobię....   .... \n\n TNTmichal. Gratulacje!')
    } catch (err) {
        throw err
    }
})

Client.on("message", (message) => {
    console.log(message.channel.id)
    if (message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes("BOT")) {
        const regex = message.content.match(/BOT (.*)/)
        if (regex != null) {
            const command = regex[1]
            switch (true) {
                case command.includes("save users"):
                    makeUserList(message, Client)
                    break
                case command.includes("punish"):
                    const time = command.split(" ")
                    rolePunish(Client, message.mentions.users, time[time.length - 1])
                    break
                case command.includes("play"):
                    ytMeneger.playMusic(message)
                    break
                case command.includes("skip"):
                    ytMeneger.skipSong(message)
                    break
            }
        }
    }
})

Client.on("guildMemberUpdate", (member) => {
    // niby dziala na kazda zmiane roi, ale tez zmianie pseudonimu jak i usuniecie albo dodanie uzytkownika
    makeUserList(member, Client)
})

Client.on("guildMemberAdd", (member) => {
    console.log("welcoming user")
    welcomeUser(member)
    // member.roles.add(member.guild.roles.cache.find(r => r.name == 'debil'))

    // user roles validation and assignment
    getFileJson().map((o) => {
        if (typeof o.clientId != "undefined" && o.clientId)
            if (o.clientId == member.user.id) {
                o.roles.map((role) => member.roles.add(member.guild.roles.cache.find((r) => r.name == role)))
            }
    })
})

console.log("działa")

Client.login(process.env.TOKEN)
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on ${port}`))
