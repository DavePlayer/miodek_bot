import fs from "fs"

class lastJudgment {
    constructor() {
        this.doomed = null
        this.roles = null
        this.user = null
    }

    readDoomed() {
        this.doomed = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"))
        const { roles } = JSON.parse(fs.readFileSync("./roles.json", "utf-8")).pop()
        this.roles = roles
    }

    saveDoomed(humanData) {
        this.doomed = [...this.doomed, humanData]
        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
    }

    saveRoles(savedRoles, user) {
        fs.writeFileSync("./roles.json", JSON.stringify(savedRoles))
        this.doomed = this.doomed.filter((o) => {
            if (o.id != user.user.id) return user
        })
        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
    }

    punishByRole(Client, users, time) {
        console.log(users)
        this.readDoomed()
        // Goes for every user on server and checks if user is still on server
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            this.user = user
            if (users.has(this.user.user.id) && isNaN(time) != true) {
                if (this.doomed.some((o) => o.id == this.user.user.id)) {
                    console.log(`${user.user.username} już nie żyż`)
                    Client.channels.cache
                        .get(process.env.DISCORD_COMMAND_CHANNEL)
                        .send(`${this.user.user.username} już nie żyż`)
                    return this.user
                } else {
                    //delete and save to file remaining roles that user had
                    const userData = { id: this.user.user.id, roles: this.user.roles.member._roles }
                    this.saveDoomed(userData)
                    user.roles
                        .remove(userData.roles)
                        .then(() => {
                            // add punishment role
                            user.roles
                                .add(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE && r))
                                .then(() => {
                                    console.log(this.doomed)

                                    Client.channels.cache
                                        .get(process.env.DISCORD_COMMAND_CHANNEL)
                                        .send(
                                            `${
                                                user.user.username
                                            } is abonished to the depths of hell 2.0 for ${parseFloat(time)} minutes`
                                        )
                                    setTimeout(async () => {
                                        console.log("------------\n zwalnianie użytkownika \n")
                                        console.log(this.doomed)
                                        this.readDoomed()

                                        //checking if user is still on server
                                        let isUserOnServer = false
                                        Client.guilds.cache
                                            .get(process.env.DISCORD_SERVER_ID)
                                            .members.cache.some((newUsers) => {
                                                if (newUsers.user.id == user.user.id) {
                                                    isUserOnServer = true
                                                    return 1
                                                }
                                            })

                                        if (isUserOnServer) {
                                            // if user is on serwer then remove punishment role from him
                                            this.doomed.some((o) => {
                                                console.log(user.user)
                                                if (o.id == user.user.id) {
                                                    console.log(`DOOMED FOUND: ${o.roles}`)
                                                    user.roles.member.roles
                                                        .add(o.roles)
                                                        .then((afterUser) => {
                                                            //after add ing this  console log it started working
                                                            /*console.log(
                                                                user.guild.roles.cache.find(
                                                                    (r) => r.name == process.env.PUNISHMENT_ROLE && r
                                                                )
                                                            )*/
                                                            afterUser.roles
                                                                .remove(
                                                                    user.guild.roles.cache.find(
                                                                        (r) =>
                                                                            r.name == process.env.PUNISHMENT_ROLE && r
                                                                    )
                                                                )
                                                                .then(() => {
                                                                    this.doomed = this.doomed.filter((o) => {
                                                                        if (o.id != user.user.id) return user
                                                                    })
                                                                    fs.writeFileSync(
                                                                        "./punishedUsers.json",
                                                                        JSON.stringify(this.doomed)
                                                                    )
                                                                })
                                                                .catch((err) => console.log(err))
                                                            return 1
                                                        })
                                                        .catch((err) => console.log(err))
                                                }
                                            })
                                        } else {
                                            let savedRoles = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
                                            if (!savedRoles.some((o2) => o2.clientId == user.user.id)) {
                                                savedRoles = [
                                                    ...savedRoles.slice(0, savedRoles.length - 1),

                                                    {
                                                        name: user.user.username,
                                                        clientId: user.user.id,
                                                        roles: this.roles
                                                            .filter((role) => {
                                                                const filtredRoles = this.doomed.filter((freeDoomed) =>
                                                                    freeDoomed.roles.includes(role.id)
                                                                )
                                                                console.log(filtredRoles)
                                                                if (filtredRoles.length > 0) return role.name
                                                            })
                                                            .map((o) => o.name),
                                                        user: user._roles,
                                                    },
                                                    savedRoles.pop(),
                                                ]
                                                console.log(savedRoles)
                                                console.log(`zwalnianie użytkownika po pliku w którym nie istnieje`)
                                                this.saveRoles(savedRoles, user)
                                            } else {
                                                console.log(savedRoles)
                                                console.log(`zwalnianie użytkownika po pliku w którym istnieje`)
                                                savedRoles.some((o) => {
                                                    //pod dawidem
                                                    if (o.clientId == user.user.id) {
                                                        console.log("found doomed")
                                                        o.roles = o.roles.filter(
                                                            (role) => role != process.env.PUNISHMENT_ROLE && role
                                                        )
                                                        console.log(o.roles)
                                                        o.roles = this.roles.map((role) => {
                                                            const [data] = this.doomed.filter((doom) => {
                                                                if (doom.id == user.user.id && doom.roles)
                                                                    return doom.roles
                                                            })
                                                            console.log("doooomed", data)
                                                            if (data.roles.includes(role.id)) return role.name
                                                        })
                                                        o.roles = o.roles.filter((ll) => ll)
                                                        return 1
                                                    }
                                                })
                                                console.log(savedRoles)
                                                this.saveRoles(savedRoles, user)
                                            }
                                            // releasing punishment role from saved roles file and returning old ones
                                        }
                                    }, parseFloat(time) * 1000 * 60)
                                })
                                .catch((err) => console.log(err))
                        })
                        .catch((err) => console.log(err))
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
