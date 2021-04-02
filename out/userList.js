"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class userDB {
    constructor() {
        this.makeUserList = (message, Client, next) => {
            this.readClient(Client);
            let json = [];
            this.temp.map((user) => {
                console.log("roles: ---- ", user.roles);
                if (user.roles.length > 0)
                    json = [
                        ...json,
                        {
                            name: user.user.username,
                            clientId: user.user.id,
                            roles: this.roles
                                .filter((role) => {
                                if (user.roles.includes(role.id))
                                    return role.name;
                            })
                                .map((o) => o.name),
                            user: user.roles,
                        },
                    ];
            });
            const obj = { users: json, roles: this.roles };
            const data = JSON.stringify(obj);
            fs_1.default.writeFile("roles.json", data, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log(`----------\n this.users saved properly`);
                    console.log(json);
                    if (next)
                        next(data);
                    this.temp = [];
                    this.roles = [];
                    this.users = json;
                    if (typeof message != "string")
                        message.channel.send("users saved properly");
                }
            });
        };
        this.users = [];
        this.temp = [];
        this.roles = [];
    }
    readClient(Client) {
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            this.temp = [...this.temp, user];
        });
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).roles.cache.forEach((role) => {
            this.roles = [...this.roles, { id: role.id, name: role.name }];
        });
    }
    readFile() {
        const file = fs_1.default.readFileSync("./roles.json", "utf-8");
        console.log(file.toString().length);
        if (file.toString().length > 2) {
            this.users = JSON.parse(file).users;
        }
        if (this.users.length > 0) {
            this.roles = JSON.parse(file).roles;
        }
    }
    updateUserList(Client) {
        this.readFile();
        if (this.users.length <= 1)
            this.makeUserList("sth", Client);
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((user) => {
            let found = false;
            this.users.some((o) => {
                if (o.clientId && o.clientId == user.user.id) {
                    found = true;
                    o.roles = this.roles
                        .filter((role) => {
                        if (user.roles.includes(role.id))
                            return role.name;
                    })
                        .map((o) => o.name);
                    return o;
                }
            });
            if (!found) {
                this.users = [
                    ...this.users,
                    {
                        name: user.user.username,
                        clientId: user.user.id,
                        roles: this.roles
                            .filter((role) => {
                            if (user.roles.includes(role.id))
                                return role.name;
                        })
                            .map((o) => o.name),
                        user: user.roles,
                    },
                ];
            }
        });
        const data = JSON.stringify({ users: this.users, roles: this.roles });
        fs_1.default.writeFile("roles.json", data, (err) => {
            if (err)
                console.log(err);
            else {
                console.log(`----------\n this.users updated properly`);
                this.users = [];
                this.roles = [];
            }
        });
        console.log(this.users, this.roles);
    }
}
exports.default = new userDB();
