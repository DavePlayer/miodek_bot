import fs from "fs"

class userDB {
    constructor() {}

    makeUserList = (message, Client) => {
        let users = []
        let roles = []
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            users = [...users, user]
        })
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).roles.cache.forEach((role) => {
            roles = [...roles, { id: role.id, name: role.name }]
        })
        let json = []
        users.map((user) => {
            if (user._roles.length > 0)
                json = [
                    ...json,
                    {
                        name: user.user.username,
                        clientId: user.user.id,
                        roles: roles
                            .filter((role) => {
                                if (user._roles.includes(role.id)) return role.name
                            })
                            .map((o) => o.name),
                        user: user._roles,
                    },
                ]
        })
        json = [...json, { roles }]
        const data = JSON.stringify(json)
        fs.writeFile("roles.json", data, (err) => {
            if (err) console.log(err)
            else console.log(`----------\n users saved properly`)
        })
    }
}

export default new userDB()
