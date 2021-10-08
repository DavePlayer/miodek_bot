import fs from "fs";
import discord, { Interaction } from "discord.js";
import userDB from "./userList";
import { role, doomed, json, user } from "./interfaces";
import Clock from "./clock";
import moment, { Moment, unitOfTime } from "moment";
import database, { IUser } from "./database";

interface newGuildMember extends discord.GuildMember {
    _roles: Array<string>;
}

class lastJudgment {
    doomed: Array<doomed>;
    roles: Array<role>;
    user: any;

    constructor() {
        this.doomed = [];
        this.roles = [];
        this.user = null;
    }

    // readDoomed(Client: discord.Client) {
    //     this.doomed = JSON.parse(fs.readFileSync("./punishedUsers.json", "utf-8"));
    //     const data = fs.readFileSync("./roles.json", "utf-8");
    //     console.log(`----------------------\n`, data, "\n--------------------");
    //     if (data.toString().length <= 1) {
    //         userDB.makeUserList(null, (data2: string) => {
    //             const json: json = JSON.parse(data2);
    //             this.roles = json.roles;
    //         });
    //     } else {
    //         console.log(data);
    //         const json: json = JSON.parse(data);
    //         this.roles = json.roles;
    //     }
    // }

    // writeDownDoomed(humanData: doomed) {
    //     this.doomed = [...this.doomed, humanData];
    //     fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed));
    // }

    // saveRoles(savedRoles: any, user: any) {
    //     fs.writeFileSync("./roles.json", JSON.stringify(savedRoles));
    //     this.doomed = this.doomed.filter((o) => {
    //         if (o.id != user.user.id) return user;
    //     });
    //     fs.writeFileSync("./punishedUsers.json", JSON.stringify(this.doomed));
    // }

    async checkRolesModyfication(
        roles: Array<string>,
        guild: discord.Guild,
        message: discord.Message | discord.CommandInteraction,
        member: discord.GuildMember
    ): Promise<boolean> {
        const roleObj = await guild.roles.fetch();
        return roleObj.some((role) => {
            if (roles.includes(role.id)) {
                if (role.editable == false || role.name == "Server Booster") {
                    message.reply(`cannot manipulate ${member} role: ${role}`);
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    getDoomed = async (clientID: string, guildID: string) => {
        const user = await database.getUser(clientID, `${guildID}-punishedUsers`);
        return user;
    };

    async punishInit(
        message: discord.Message | discord.CommandInteraction,
        punishmentRole: discord.Role | any,
        member: discord.GuildMember | any,
        time: string
    ) {
        // Goes for every user on server and checks if user is still on server and if is alive
        message.guild.members.fetch().then(async (members) => {
            if (members.has(member.id)) {
                const isDoomed = await this.getDoomed(member.id, message.guild.id);
                if (isDoomed != null) {
                    console.log(`${this.user.user.username} is already being punished`);
                    message.reply({
                        content: `${member} is being punished at the moment`,
                        ephemeral: true,
                    });
                } else {
                }
                if (await this.checkRolesModyfication(member._roles, message.guild, message, member)) {
                } else {
                    this.punishByRole(message, time, member, punishmentRole);
                    // console.log("punish this man");
                    // message.reply(`punishing user - temp`);
                }
            } else {
                console.log(`user not on server`);
            }
        });
    }

    async releaseDoomed(
        member: discord.GuildMember & { _roles: Array<string> },
        message: discord.Message | discord.CommandInteraction,
        punishmentRole: discord.Role,
        userData: IUser
    ) {
        //checking if user is still on server
        const allMembers = await message.guild.members.fetch();
        const isUserOnServer = allMembers.has(member.user.id);
        if (isUserOnServer) {
            const doomedUser = await this.getDoomed(member.user.id, message.guild.id);
            // return user his roles
            member.roles
                .add(doomedUser.rolesIds)
                .then((afterUser: discord.GuildMember) => {
                    //after adding roles back, remove punishment role
                    afterUser.roles.remove(punishmentRole).catch((err: discord.ErrorEvent) => console.log(err));
                    return;
                })
                .catch((err: discord.ErrorEvent) => console.log(err));
        } else {
            // edit database to give back roles
            await database.upsertUser(userData, message.guild.id);
        }
        await database.removeUser(member.user.id, `${message.guild.id}-punishedUsers`);
    }

    punishByRole(
        message: discord.Message | discord.CommandInteraction,
        time: string,
        member: discord.GuildMember & { _roles: Array<string> },
        punishmentRole: discord.Role
    ) {
        console.log("coś działa XD");
        const userData: IUser = { name: member.user.username, ClientId: member.user.id, rolesIds: member._roles };
        member.roles.remove(userData.rolesIds).then((lateruser: discord.GuildMember) => {
            lateruser.roles.add(punishmentRole).then((afterAfterUser: discord.GuildMember) => {
                const type: string = time.slice(-1);
                const timeNum: number = parseInt(time.slice(0, -1));
                const releasement: Moment = moment().add(timeNum, `${type}` as unitOfTime.DurationConstructor);
                message.reply(
                    `${member} is assigned ${punishmentRole}. Person shall be released: \`${releasement.date()}-${
                        releasement.month() + 1
                    }-${releasement.year()} at ${releasement.hour()}:${releasement.minutes()}:${releasement.seconds()}\``
                );
                //setTimeout(() => this.releaseDoomed(afterAfterUser, Client), 1000 * parseInt(time))
                Clock.addDynamicReminder({
                    time: releasement,
                    func: () => this.releaseDoomed(member, message, punishmentRole, userData),
                });
                database.insertNewUser(userData, `${message.guild.id}-punishedUsers`);
            });
        });
    }
}

export default new lastJudgment();
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
