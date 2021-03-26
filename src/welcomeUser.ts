import * as fs from "fs"
import discord, {GuildMember} from 'discord.js'

export const welcomeUser = (member: discord.PartialGuildMember | GuildMember) => {
    const welcomeMessages = [
        `Świeże mięso na horyzoncie <@${member.user!.id}>`,
        `Popełnijmy razem przestępstwo podatkowe <@${member.user!.id}>`,
        `Welcome to the cum zone <@${member.user!.id}>`,
        `Brawo! Znalazłeś jeden z lepszych śmietników na tym świecie <@${member.user!.id}>`,
        `GOD IS DED!! GOD WEMEINS DED! AND WE AWD <@${member.user!.id}> HAVE KIWWED HIM! HOW SHAWW WE COMFOWT OWSEWVES! THE MWUWDEWEWS OF AWWW MWUWDEWEWS! `,
        `<@${member.user!.id}> Witaj na tym zacnym serwerze`,
        `<@${member.user!.id}>  Uszanowanie`,
        `Uwarzaj <@${member.user!.id}>  Administracja czuje strach `,
        `AVE <@${member.user!.id}>  KLOCEK DAVE'A Z TOBĄ I DUCHEM TWOIM `,
        `Witaj śmiertelniku <@${member.user!.id}>`,
    ]
    let randomNumber = Math.floor(Math.random() * welcomeMessages.length)
    let usedMessages: Array<number> = JSON.parse(fs.readFileSync("./usedMessages.json", "utf-8"))
    if (usedMessages.length >= welcomeMessages.length) usedMessages = []
    while (usedMessages.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random() * welcomeMessages.length)
    }
    usedMessages = [...usedMessages, randomNumber]
   const data: string = JSON.stringify(usedMessages);
    fs.writeFileSync("./usedMessages.json", data);
    (member.guild.channels.cache.get(process.env.DISCORD_WELCOME_CHANNEL as string) as discord.TextChannel).send(welcomeMessages[randomNumber])
}
