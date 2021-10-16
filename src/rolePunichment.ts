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
    inmateNumber: number;

    constructor() {
        this.doomed = [];
        this.roles = [];
        this.user = null;
        this.inmateNumber = 0;
    }

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
        this.inmateNumber += 1;
        message.guild.members.fetch().then(async (members) => {
            if (members.has(member.id)) {
                const isDoomed = await this.getDoomed(member.id, message.guild.id);
                if (isDoomed != null) {
                    console.log(`${member} is already being punished`);
                    message.reply({
                        content: `${member} is being punished at the moment`,
                        ephemeral: true,
                    });
                } else {
                    if (await this.checkRolesModyfication(member._roles, message.guild, message, member)) {
                    } else {
                        this.punishByRole(message, time, member, punishmentRole, this.inmateNumber);
                        // console.log("punish this man");
                        // message.reply(`punishing user - temp`);
                    }
                }
            } else {
                console.log(`user not on server`);
                message.reply(`user ${member} is not on server`);
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
        try {
            const allMembers = await message.guild.members.fetch();
            const isUserOnServer = allMembers.has(member.user.id);
            if (isUserOnServer) {
                const doomedUser = await this.getDoomed(member.user.id, message.guild.id);
                // return user his roles
                if (doomedUser) {
                    member.roles
                        .add(doomedUser.rolesIds)
                        .then((afterUser: discord.GuildMember) => {
                            //after adding roles back, remove punishment role
                            afterUser.roles.remove(punishmentRole).catch((err: discord.ErrorEvent) => console.log(err));
                            return;
                        })
                        .catch((err: discord.ErrorEvent) => console.log(err));
                } else throw new Error("user is not doomed");
            } else {
                // edit database to give back roles
                await database.upsertUser(userData, message.guild.id);
            }
            await database.removeUser(member.user.id, `${message.guild.id}-punishedUsers`);
        } catch (error) {
            console.log(error);
        }
    }

    punishByRole(
        message: discord.Message | discord.CommandInteraction,
        time: string,
        member: discord.GuildMember & { _roles: Array<string> },
        punishmentRole: discord.Role,
        inmateNum: number
    ) {
        const userData: IUser = {
            name: member.user.username,
            ClientId: member.user.id,
            rolesIds: member._roles,
        };
        member.roles.remove(userData.rolesIds).then((lateruser: discord.GuildMember) => {
            lateruser.roles.add(punishmentRole).then((afterAfterUser: discord.GuildMember) => {
                const type: string = time.slice(-1);
                const timeNum: number = parseInt(time.slice(0, -1));
                const releasement: Moment = moment().add(timeNum, `${type}` as unitOfTime.DurationConstructor);
                const buttonRows = new discord.MessageActionRow().addComponents(
                    new discord.MessageButton({
                        customId: `relase-${member.user.id}-${inmateNum}`,
                        label: "release",
                        style: "PRIMARY",
                    })
                );
                const collector = message.channel.createMessageComponentCollector({
                    // max: 1,
                    // time: releasement.valueOf() - moment().valueOf(),
                });
                collector.on("collect", async (button) => {
                    if (button.customId == `relase-${member.user.id}-${inmateNum}`) {
                        const Doomed = await this.getDoomed(member.user.id, member.guild.id);
                        if (Doomed != null) {
                            Clock.removeDynamicReminder(`punishment-${member.user.id}`);
                            this.releaseDoomed(member, message, punishmentRole, userData)
                                .then(() => {
                                    (message as discord.CommandInteraction).editReply({
                                        content: `Person was released faster at: \`${moment().date()}-${
                                            moment().month() + 1
                                        }-${moment().year()} at ${moment().hour()}:${moment().minutes()}:${moment().seconds()}\``,
                                        components: [],
                                    });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    button.reply({
                                        content: `${err}`,
                                        ephemeral: true,
                                    });
                                });
                        }
                    }
                });
                message.reply({
                    content: `${member} is assigned ${punishmentRole}. Person shall be released: \`${releasement.date()}-${releasement.month()}-${releasement.year()} at ${releasement.hour()}:${releasement.minutes()}:${releasement.seconds()}\`\nbuttonId: relase-${
                        member.user.id
                    }`,
                    components: [buttonRows],
                });
                //setTimeout(() => this.releaseDoomed(afterAfterUser, Client), 1000 * parseInt(time))
                Clock.addDynamicReminder({
                    id: `punishment-${member.user.id}`,
                    time: releasement,
                    func: () => this.releaseDoomed(member, message, punishmentRole, userData),
                });
                database.insertNewUser(userData, `${message.guild.id}-punishedUsers`);
            });
        });
    }
}

export default new lastJudgment();
