import fs from "fs"

class userDB {
    constructor() {
        this.users = []
        this.roles = []
    }

    readClient(Client) {
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            this.users = [...this.users, user]
        })
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).roles.cache.forEach((role) => {
            this.roles = [...this.roles, { id: role.id, name: role.name }]
        })
    }

    readFile() {
        this.users = JSON.parse(fs.readFileSync("./roles.json", "utf-8"))
        const { roles } = this.users.pop()
        this.roles = roles
    }

    makeUserList = (message, Client) => {
        this.readClient(Client)
        let json = []
        this.users.map((user) => {
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
        json = [...json, { roles: this.roles }]
        const data = JSON.stringify(json)
        fs.writeFile("roles.json", data, (err) => {
            if (err) console.log(err)
            else console.log(`----------\n this.users saved properly`)
        })
    }

    updateUserList(Client) {
        this.readFile()
        if (this.users.length <= 1) this.makeUserList()

        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            this.users.some((o) => {
                if (o.clientId && o.clientId == user.user.id) {
                    o.roles = this.roles
                        .filter((role) => {
                            if (user._roles.includes(role.id)) return role.name
                        })
                        .map((o) => o.name)
                    return o
                }
            })
        })
        const data = JSON.stringify([...this.users, { roles: this.roles }])
        fs.writeFile("roles.json", data, (err) => {
            if (err) console.log(err)
            else console.log(`----------\n this.users updated properly`)
        })
        console.log(this.users, this.roles)
    }
}

export default new userDB()
