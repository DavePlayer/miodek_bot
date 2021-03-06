import fs from "fs"
import discord, {GuildChannel} from 'discord.js'
import { user, role, json }from './interfaces'
import {resolve} from "node:dns"

class userDB {
    users: Array<user>
    temp: Array<discord.GuildMember>
    roles: Array<role>

    constructor() {
        this.users = []
        this.temp = []
        this.roles = []
    }

    readClient(Client:discord.Client) {
        (Client.guilds.cache.get(process.env.DISCORD_SERVER_ID as string) as discord.Guild).members.cache.forEach((user: discord.GuildMember) => {
            this.temp = [...this.temp, user]
        });

        (Client.guilds.cache.get(process.env.DISCORD_SERVER_ID as string) as discord.Guild).roles.cache.forEach((role: discord.Role) => {
            this.roles = [...this.roles, { id: role.id, name: role.name }]
        })
    }

    readFile = (Client: discord.Client) => new Promise<any>( (res, rej) => {
        const file = fs.readFileSync("./roles.json", "utf-8")
        if (file.toString().length > 2) {
            this.users = JSON.parse(file).users
            this.roles = JSON.parse(file).roles
            res(true)
        } else {
            rej(false)
        }
        console.log(file)
    } )

    makeUserList = (message:discord.Message | string, Client:discord.Client, next?: (data:string) => void ) => {
        this.readClient(Client)
        let json: [] | Array<user> = []
        this.temp.map((user: any) => {
            if (user._roles.length > 0)
                json = [
                    ...json,
                    {
                        name: user.user.username,
                        clientId: user.user.id,
                        roles: this.roles
                            .filter((role) => {
                                if (user._roles.includes(role.id)) return role.name
                            })
                            .map((o) => o.name),
                        user: user._roles,
                    },
                ]
        })
        const obj:json = {users: json, roles: this.roles }
        const data: string = JSON.stringify(obj)
        fs.writeFile("roles.json", data, (err) => {
            if (err) console.log(err)
            else {
                console.log(`----------\n this.users saved properly`)
                if (next) next(data)
                this.temp = []
                this.roles = []
                this.users = json
                if (typeof message != "string") message.channel.send("users saved properly")
            }
        })
    }

    updateUserList(Client: discord.Client) {
        this.readFile(Client).then( () => {
            (Client.guilds.cache.get(process.env.DISCORD_SERVER_ID as string) as discord.Guild).members.cache.forEach((user:any) => {
                let found = false
                this.users.some((o) => {
                    if (o.clientId && o.clientId == user.user.id) {
                        found = true
                        o.roles = this.roles
                            .filter((role) => {
                                if (user._roles.includes(role.id)) return role.name
                            })
                            .map((o) => o.name)
                        return o
                    }
                })
                if (!found) {
                    this.users = [
                        ...this.users,
                        {
                            name: user.user.username,
                            clientId: user.user.id,
                            roles: this.roles
                                .filter((role) => {
                                    if (user._roles.includes(role.id)) return role.name
                                })
                                .map((o) => o.name),
                            user: user._roles,
                        },
                    ]
                }
            })
            const data:string = JSON.stringify({users: this.users,  roles: this.roles })
            fs.writeFile("roles.json", data, (err) => {
                if (err) console.log(err)
                else {
                    console.log(`----------\n this.users updated properly`)
                    this.users = []
                    this.roles = []
                }
            })
            console.log(this.users, this.roles)
        })
        .catch( () => this.makeUserList('dsa', Client) )
    }
}

export default new userDB()
