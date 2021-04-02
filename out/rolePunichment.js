"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const userList_1 = __importDefault(require("./userList"));
const timer_1 = __importDefault(require("./timer"));
class lastJudgment {
    constructor() {
        this.doomed = [];
        this.roles = [];
        this.user = null;
    }
    readDoomed(Client) {
        this.doomed = JSON.parse(fs_1.default.readFileSync("./punishedUsers.json", "utf-8"));
        const data = fs_1.default.readFileSync("./roles.json", "utf-8");
        console.log(`----------------------\n`, data, "\n--------------------");
        if (data.toString().length <= 1) {
            userList_1.default.makeUserList("dsa", Client, (data2) => {
                const json = JSON.parse(data2);
                this.roles = json.roles;
            });
        }
        else {
            console.log(data);
            const json = JSON.parse(data);
            this.roles = json.roles;
        }
    }
    writeDownDoomed(humanData) {
        this.doomed = [...this.doomed, humanData];
        fs_1.default.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed));
    }
    saveRoles(savedRoles, user) {
        fs_1.default.writeFileSync("./roles.json", JSON.stringify(savedRoles));
        this.doomed = this.doomed.filter((o) => {
            if (o.id != user.user.id)
                return user;
        });
        fs_1.default.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed));
    }
    punishInit(Client, message, time) {
        const users = message.mentions.users;
        this.readDoomed(Client);
        // Goes for every user on server and checks if user is still on server
        Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach((member) => {
            this.user = member;
            if (users.has(this.user.user.id)) {
                if (this.doomed.some((doomed) => doomed.id == this.user.user.id)) {
                    console.log(`${this.user.user.username} już nie żyż`);
                    message.channel.send(`${this.user.user.username} już nie żyż`);
                    return this.user;
                }
                this.punishByRole(Client, message, time, this.user);
            }
        });
    }
    releaseDoomed(user, Client) {
        //checking if user is still on server
        let isUserOnServer = false;
        Client.guilds.cache
            .get(process.env.DISCORD_SERVER_ID)
            .members.cache.some((newUsers) => {
            if (newUsers.user.id == user.user.id) {
                isUserOnServer = true;
                return true;
            }
        });
        if (isUserOnServer) {
            this.doomed.some((o) => {
                if (o.id == user.user.id) {
                    console.log(`DOOMED FOUND: ${o.roles}`);
                    user.roles.member.roles
                        .add(o.roles)
                        .then((afterUser) => {
                        //after adding roles back, remove punishment role
                        afterUser.roles
                            .remove(user.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE && r))
                            .then(() => {
                            //after removing punishment role, remove user from doomed file
                            this.doomed = this.doomed.filter((o) => {
                                if (o.id != user.user.id)
                                    return user;
                            });
                            fs_1.default.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed));
                        })
                            .catch((err) => console.log(err));
                        return 1;
                    })
                        .catch((err) => console.log(err));
                }
            });
        }
        else {
            this.releaseDoomedFromFile(user, Client);
        }
    }
    releaseDoomedFromFile(user, Client) {
        let savedRoles = JSON.parse(fs_1.default.readFileSync("./roles.json", "utf-8"));
        savedRoles.users.some((o) => {
            if (o.clientId == user.user.id) {
                console.log(`zwalnianie użytkownika po pliku w którym istnieje`);
                console.log("found doomed");
                o.roles = o.roles.filter((role) => role != process.env.PUNISHMENT_ROLE && role);
                console.log(o.roles);
                o.roles = this.roles.filter((role) => {
                    const [data] = this.doomed.filter((doom) => {
                        if (doom.id == user.user.id && doom.roles)
                            return doom.roles;
                    });
                    console.log("doooomed", data);
                    if (data.roles.includes(role.id))
                        return role;
                }).map((ll) => ll.name);
                return 1;
            }
        });
        console.log(savedRoles);
        this.saveRoles(savedRoles, user);
    }
    punishByRole(Client, message, time, user) {
        console.log('coś działa XD');
        const userData = { id: user.user.id, roles: user._roles };
        console.log(userData);
        user.roles
            .remove(userData.roles)
            .then((lateruser) => {
            lateruser.roles
                .add(lateruser.guild.roles.cache.find((r) => r.name == process.env.PUNISHMENT_ROLE && r))
                .then((afterAfterUser) => {
                this.writeDownDoomed(userData);
                message.channel.send(`${user.user.username} is abonished to the depths of hell 2.0 for ${parseFloat(time)} minutes`);
                //setTimeout(() => this.releaseDoomed(afterAfterUser, Client), 1000 * parseInt(time))
                timer_1.default.addDynamicReminder({
                    time: new Date(new Date().getTime() + 1000 * 60 * parseInt(time)),
                    func: () => this.releaseDoomed(afterAfterUser, Client)
                });
            });
        });
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
exports.default = new lastJudgment();
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
