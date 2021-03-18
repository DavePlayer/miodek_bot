import fs from "fs"

class lastJudgment {
    constructor() {
        this.doomed = null
        this.roles = null
    }

    readDoomed() {
        this.doomed = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"))
        this.roles = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))[-1]
    }

    saveDoomed(humanData) {
        this.doomed = [...this.doomed, humanData]
        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
    }

    punishByRole(Client, users, time) {
        console.log(users)
        this.readDoomed()
        // Goes for every user on server and checks if user is still on server
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            if (users.has(user.user.id) && isNaN(time) != true) {
                if (this.doomed.some((o) => o.id == user.user.id)) {
                    console.log(`${user.user.username} już nie żyż`)
                    Client.channels.cache
                        .get(process.env.DISCORD_COMMAND_CHANNEL)
                        .send(`${user.user.username} już nie żyż`)
                    return user
                } else {
                    //delete and save to file remaining roles that user had
                    const userData = { id: user.user.id, roles: user.roles.member._roles }
                    this.saveDoomed(userData)
                    user.roles.member.roles.remove(userData.roles)

                    // add punishment role
                    user.roles.add(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE))

                    console.log(this.doomed)

                    Client.channels.cache
                        .get(process.env.DISCORD_COMMAND_CHANNEL)
                        .send(
                            `${user.user.username} is abonished to the depths of hell 2.0 for ${parseInt(time)} minutes`
                        )
                    setTimeout(async () => {
                        console.log("------------\n zwalnianie użytkownika \n")
                        console.log(this.doomed)

                        //checking if user is still on server
                        let isUserOnServer = false
                        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.some((newUsers) => {
                            if (newUsers.user.id == user.user.id) {
                                isUserOnServer = true
                                return 1
                            }
                        })
                        if (isUserOnServer) {
                            // if user is on serwer then remove punishment role from him
                            user.roles.remove(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE))
                            this.readDoomed()
                            this.doomed.some((o) => {
                                console.log("xdddddddddddddddddddddddddddd")
                                if (o.id == user.user.id) {
                                    console.log(`DOOMED FOUND: ${o.roles}`)
                                    user.roles.member.roles.add(o.roles)
                                }
                            })
                        } else {
                            // releasing punishment role from saved roles file and returning old ones
                            console.log(`zwalnianie użytkownika po pliku`)
                            let savedRoles = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
                            savedRoles.some((o) => {
                                if (o.clientId == user.user.id) {
                                    console.log(`------------------\nroles inf ifle: ${o.roles}\n--------------`)
                                    o.roles = o.roles.filter((role) => role != process.env.PUNISHMENT_ROLE)
                                    //to be continued...
                                    //o.user = userData.roles
                                    return 1
                                }
                            })
                            fs.writeFileSync("./roles.json", JSON.stringify(savedRoles))
                        }

                        this.doomed = this.doomed.filter((o) => {
                            if (o.id != user.user.id) return user
                        })
                        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
                    }, parseFloat(time) * 1000 * 60)
                }
            } else {
                console.log("not this user or time invalid")
            }
        })
    }
}

export default new lastJudgment()
/*
export const rolePunish = (Client, users, time) => {
    console.log("punish him", users, time)

    let punishedUsers = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"))
    //if(punishedUsers.includes(userName)){
    //console.log('user already punished')
    //return false
    // }
    const json = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
    const roles = json[json.length - 1]
    })
}
*/
