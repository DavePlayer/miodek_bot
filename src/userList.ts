import fs from "fs";
import discord, { GuildChannel } from "discord.js";
// import { user, role, json } from "./interfaces";
import Database, { IUser } from "./database";
import { ObjectId } from "mongodb";

export interface INormalUser extends discord.GuildMember {
    _roles: Array<string>;
}

class userDB {
    users: Array<discord.GuildMember>;
    roles: Array<any>;

    constructor() {
        this.users = [];
        this.roles = [];
    }

    readClient = (message: discord.Message | discord.CommandInteraction) =>
        new Promise<discord.Collection<string, discord.GuildMember>>((res, rej) => {
            message.guild.members
                .fetch()
                .then((members) => {
                    res(members);
                })
                .catch((err) => rej(err));
        });

    makeUserList = (message: discord.Message | discord.CommandInteraction, next?: (data: string) => void) => {
        this.users = [];
        this.readClient(message)
            .then((members: discord.Collection<string, discord.GuildMember>) => {
                members.forEach((user: discord.GuildMember) => {
                    this.users = [...this.users, user];
                });
            })
            .then(() => {
                let mapedUsers: [] | Array<IUser> = [];
                this.users.map((user: any) => {
                    // console.log(user);
                    if (user._roles.length > 0)
                        mapedUsers = [
                            ...mapedUsers,
                            {
                                name: user.user.username,
                                ClientId: user.user.id,
                                rolesIds: user._roles,
                            },
                        ];
                });
                console.log("mapped users: ", mapedUsers);
                Database.resetUserDataBase(message.guild.id).then(() =>
                    Database.insertNewUsers(mapedUsers, message.guild.id)
                );
            });
        // fs.writeFile("roles.json", data, (err) => {
        //     if (err) console.log(err);
        //     else {
        //         console.log(`----------\n this.users saved properly`);
        //         if (next) next(data);
        //         this.temp = [];
        //         this.roles = [];
        //         this.users = json;
        //         if (typeof message != "string") message.channel.send("users saved properly");
        //     }
        // });
    };

    updateUserList(member: INormalUser) {
        const updatedUser: IUser = {
            name: member.user.username,
            ClientId: member.user.id,
            rolesIds: member._roles,
        };
        Database.upsertUser(updatedUser, member.guild.id);
    }
}

export default new userDB();
