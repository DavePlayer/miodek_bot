import fs from "fs"

export const rolePunish = (Client, users, time) => {
    console.log("punish him", users, time)

    let punishedUsers = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"))
    //if(punishedUsers.includes(userName)){
    //console.log('user already punished')
    //return false
    // }
    const json = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
    const roles = json[json.length - 1]
    const cache = Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
        if (users.has(user.user.id) && isNaN(time) != true) {
            if (punishedUsers.includes(user.user.username)) {
                console.log(`${user.user.username} już nie żyż`)
                Client.channels.cache.get(process.env.DISCORD_COMMAND_CHANNEL).send(`${user.user.username} już nie żyż`)
                return user
            } else {
                user.roles.add(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE))
                punishedUsers = [...punishedUsers, user.user.username]
                fs.writeFileSync("./punishedUsers.json", JSON.stringify(punishedUsers))
                Client.channels.cache
                    .get(process.env.DISCORD_COMMAND_CHANNEL)
                    .send(`${user.user.username} is abonished to the depths of hell 2.0 for ${parseInt(time)} minutes`)
                setTimeout(async () => {
                    console.log("------------\n zwalnianie użytkownika \n")
                    punishedUsers = punishedUsers.filter((o) => {
                        if (o != user.user.username) return user
                    })
                    fs.writeFileSync("./punishedUsers.json", JSON.stringify(punishedUsers))
                    console.log(
                        punishedUsers.filter((o) => {
                            if (o != user.user.username) return user
                        })
                    )
                    let isUserOnServer = false
                    Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((newUsers) => {
                        if (newUsers.user.id == user.user.id) isUserOnServer = true
                    })
                    if (isUserOnServer) {
                        user.roles.remove(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE))
                    } else {
                        console.log(`zwalnianie użytkownika po pliku`)
                        let savedRoles = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
                        savedRoles.map((o) => {
                            if (o.clientId == user.user.id) {
                                console.log(o.name)
                                o.roles = o.roles.filter((role) => role != process.env.PUNISHMENT_ROLE)
                            }
                        })
                        fs.writeFileSync("./roles.json", JSON.stringify(savedRoles))
                    }
                }, parseInt(time) * 1000 * 60)
            }
        } else {
            console.log("sth went wrong")
        }
    })
    console.log(punishedUsers)
}
