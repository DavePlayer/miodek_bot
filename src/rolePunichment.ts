import fs from "fs"
import discord from 'discord.js'
import userDB from "./userList"
import { role, doomed, json, user } from './interfaces'
import Clock from './timer'
import moment, {Moment, unitOfTime} from 'moment'

interface newGuildMember extends discord.GuildMember {
    _roles: Array<string>
}

class lastJudgment {
    doomed:  Array<doomed>
    roles:  Array<role>
    user: any

    constructor() {
        this.doomed = []
        this.roles = []
        this.user = null
    }

    readDoomed(Client: discord.Client) {
        this.doomed = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"))
        const data = fs.readFileSync("./roles.json", "utf-8")
        console.log(`----------------------\n`, data, "\n--------------------")
        if (data.toString().length <= 1) {
            userDB.makeUserList("dsa", Client, (data2: string) => {
                const json:json = JSON.parse(data2)
                this.roles = json.roles
            })
        } else {
            console.log(data)
            const json:json = JSON.parse(data)
            this.roles = json.roles
        }
    }

    writeDownDoomed(humanData: doomed) {
        this.doomed = [...this.doomed, humanData]
        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
    }

    saveRoles(savedRoles: any, user: any) {
        fs.writeFileSync("./roles.json", JSON.stringify(savedRoles))
        this.doomed = this.doomed.filter((o) => {
            if (o.id != user.user.id) return user
        })
        fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed))
    }

    checkRolesModyfication(roles: Array<string>, guild: discord.Guild): boolean {
        return roles.some( role => {
            const roleObj:discord.Role = guild.roles.cache.find( (r: discord.Role) => r.id == role)
            console.log(roleObj.editable)
            if(roleObj.editable == false){
                return true
            } 
        })
    }

    punishInit(Client: discord.Client, message: discord.Message, time: string) {
        const users = message.mentions.users
        this.readDoomed(Client)
        // Goes for every user on server and checks if user is still on server
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((member: discord.GuildMember) => {
            this.user = member
            if (users.has(this.user!.user.id)){
                if(this.doomed.some( (doomed: doomed) => doomed.id == this.user.user.id)){
                    console.log(`${this.user.user.username} już nie żyż`)
                    message.channel.send(`${this.user.user.username} już nie żyż`)
                    return this.user
                } else if( isNaN(parseInt(time.slice(0, -1))) == false && typeof time[time.length -1] == 'string' ) {
                    if(this.checkRolesModyfication(this.user._roles, Client.guilds.cache.get(process.env.DISCORD_SERVER_ID))){
                        message.channel.send(`Cannot manipulate ${member.user.username} role`)
                        return false
                    } else this.punishByRole(Client, message, time, this.user)
                } else {
                    message.reply('invalid time')
                }
            }
        })
    }

    releaseDoomed(user:any, Client:discord.Client) {
        //checking if user is still on server
        let isUserOnServer:boolean = false
        Client.guilds.cache
            .get(process.env.DISCORD_SERVER_ID)
            .members.cache.some((newUsers: discord.GuildMember) => {
                if (newUsers.user.id == user.user.id) {
                    isUserOnServer = true
                    return true
                }
            })
        if(isUserOnServer) {
            this.doomed.some((o) => {
                if (o.id == user.user.id) {
                    console.log(`DOOMED FOUND: ${o.roles}`)
                    user.roles.member.roles
                        .add(o.roles)
                        .then((afterUser: discord.GuildMember) => {
                            //after adding roles back, remove punishment role
                            afterUser.roles
                                .remove(
                                    user.guild.roles.cache.find(
                                        (r: discord.Role) =>
                                            r.name == process.env.PUNISHMENT_ROLE && r
                                    )
                                )
                                .then(() => {
                                    //after removing punishment role, remove user from doomed file
                                    this.doomed = this.doomed.filter((o) => {
                                        if (o.id != user.user.id) return user
                                    })
                                    fs.writeFileSync(
                                        "./punishedUsers.json",
                                        JSON.stringify(this.doomed)
                                    )
                                })
                                .catch((err: discord.ErrorEvent) => console.log(err))
                            return 1
                        })
                        .catch((err: discord.ErrorEvent) => console.log(err))
                }
            })
        } else {
            this.releaseDoomedFromFile(user, Client)
        }
        
    }

    releaseDoomedFromFile(user:any, Client:discord.Client ) {
        let savedRoles: json = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
        savedRoles.users.some((o: user) => {
            if (o.clientId == user.user.id) {
                console.log(`zwalnianie użytkownika po pliku w którym istnieje`)
                console.log("found doomed")
                o.roles = o.roles.filter(
                    (role) => role != process.env.PUNISHMENT_ROLE && role
                )
                console.log(o.roles)
                o.roles = this.roles.filter((role: role) => {
                    const [data] = this.doomed.filter((doom) => {
                        if (doom.id == user.user.id && doom.roles) return doom.roles
                    })
                    console.log("doooomed", data)
                    if (data.roles.includes(role.id)) return role
                }).map((ll) => ll.name)
                return 1
            }
        })
        console.log(savedRoles)
        this.saveRoles(savedRoles, user)
    }

    punishByRole(Client: discord.Client, message: discord.Message, time: string, user:any) {
        console.log('coś działa XD')
        const userData = { id: user.user.id, roles: user._roles }
        console.log(userData)
        user.roles
            .remove(userData.roles)
            .then( (lateruser:any) => {

                lateruser.roles
                    .add(lateruser.guild.roles.cache.find((r: discord.Role) => r.name == process.env.PUNISHMENT_ROLE && r))
                    .then((afterAfterUser:any) => {
                        this.writeDownDoomed(userData)
                        const type:string = time.slice(-1)
                        const timeNum:number = parseInt(time.slice(0, -1))
                        const releasement:Moment = moment().add(timeNum, `${type}` as unitOfTime.DurationConstructor)
                        message.channel.send(`${user.user.username} is abonished to the depths of hell 2.0. Person shall be released: \`${releasement.date()}-${releasement.month()+1}-${releasement.year()} at ${releasement.hour()}:${releasement.minutes()}:${releasement.seconds()}\``)
                        //setTimeout(() => this.releaseDoomed(afterAfterUser, Client), 1000 * parseInt(time))
                        Clock.addDynamicReminder({
                            time: releasement,
                            func: () => this.releaseDoomed(afterAfterUser, Client)
                        })
                    })
            } )

        //gonna be rewriten either way, so for now it's unnecessary
/*        console.log(users)
        this.readDoomed(Client)
        // Goes for every user on server and checks if user is still on server
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user: discord.user) => {
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
                                .add(user.guild.roles.cache.find((r: discord.role) => r.name == process.env.PUNISHMENT_ROLE && r))
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
                                        this.readDoomed(Client)

                                        //checking if user is still on server
                                        let isUserOnServer = false
                                        Client.guilds.cache
                                            .get(process.env.DISCORD_SERVER_ID)
                                            .members.cache.some((newUsers: discord.members) => {
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
                                                        .then((afterUser: discord.user) => {
                                                            //after add ing this  console log it started working
                                                            /*console.log(
                                                                user.guild.roles.cache.find(
                                                                    (r) => r.name == process.env.PUNISHMENT_ROLE && r
                                                                )
                                                            )
                                                            afterUser.roles
                                                                .remove(
                                                                    user.guild.roles.cache.find(
                                                                        (r: discord.role) =>
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
                                                                .catch((err: discord.err) => console.log(err))
                                                            return 1
                                                        })
                                                        .catch((err: discord.err) => console.log(err))
                                                }
                                            })
                                        } else {
                                            let savedRoles: roles = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
                                            console.log(savedRoles)
                                            console.log(`zwalnianie użytkownika po pliku w którym istnieje`)
                                            savedRoles.some((o: user | rolesArray) => {
                                                //pod dawidem
                                                if (o.clientId == user.user.id) {
                                                    console.log("found doomed")
                                                    o.roles = o.roles.filter(
                                                        (role) => role != process.env.PUNISHMENT_ROLE && role
                                                    )
                                                    console.log(o.roles)
                                                    o.roles =this.roles.filter((role: role) => {
                                                        const [data] = this.doomed.filter((doom) => {
                                                            if (doom.id == user.user.id && doom.roles) return doom.roles
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
        })*/
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
