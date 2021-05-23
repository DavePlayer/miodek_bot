import discord from "discord.js";

export const cloneServer = (serverId: string, message: discord.Message, Client: discord.Client) => {
    Client.guilds
        .fetch(serverId)
        .then((targetGuild: discord.Guild) => {
            // targetGuild.channels.cache.clone()A

            // roles cloning
            const rolesClone = message.guild.roles.cache.clone();
            let permisionsIds: Array<{ oldId: string; newId: string; name?: string }> = [];

            const rolesPromise = rolesClone.map(async (role) => {
                console.log(role.name);
                if (role.name == "@everyone") {
                    permisionsIds.push({
                        oldId: role.id,
                        newId: targetGuild.roles.cache.find((schRole) => schRole.name == "@everyone").id,
                        name: role.name,
                    });
                }
                if (targetGuild.roles.cache.some((rl) => rl.name.toLowerCase() == role.name.toLowerCase()) == false && role.name != process.env.BOT_NAME && role.name != "@everyone")
                    return targetGuild.roles
                        .create({
                            data: {
                                name: role.name,
                                color: role.color,
                                mentionable: role.mentionable,
                                permissions: role.permissions,
                            },
                        })
                        .then((afterRole) => {
                            permisionsIds = [...permisionsIds, { oldId: role.id, newId: afterRole.id, name: role.name }];
                            console.log(`created ${afterRole.name} role`);
                        })
                        .catch((err) => console.log(err));
            });
            Promise.all(rolesPromise).then(() => {
                console.log("permisions");
                console.log(permisionsIds);
                // cahnnels cloning
                const channelsClone = message.guild.channels.cache.clone();
                // first categories
                const categoryPromises = channelsClone.map(async (channel) => {
                    if (!targetGuild.channels.cache.find((ch) => ch.name.toLowerCase() == channel.name.toLowerCase()) && channel.type == "category") {
                        return targetGuild.channels
                            .create(channel.name, {
                                permissionOverwrites: channel.permissionOverwrites,
                                type: channel.type,
                                position: channel.position,
                            })
                            .then((afterChannel) => console.log(`created category channel: ${afterChannel.name}`));
                    }
                });
                Promise.all(categoryPromises).then(() => {
                    channelsClone.map((channel) => {
                        console.log(channel.name);
                        console.log(channel.permissionOverwrites);
                        let parent: any = null;
                        if (channel.type != "category") {
                            parent = targetGuild.channels.cache.filter((cat) => cat.name == channel.parent.name);
                            parent = Array.from(parent.keys());
                            //parent = targetGuild.channels.cache.get(parent[0]);
                            parent = targetGuild.channels.cache.get(parent[0]);
                            channel.permissionOverwrites.map((data) => {
                                console.log("id", data.id);
                                let newPermision = permisionsIds.filter((id) => id.oldId == data.id);
                                if (newPermision.length == 0) {
                                    newPermision = [
                                        {
                                            oldId: data.id,
                                            newId: targetGuild.roles.cache.find((role) => role.name == process.env.BOT_NAME).id,
                                            name: process.env.BOT_NAME,
                                        },
                                    ];
                                }
                                console.log(newPermision);
                                channel.permissionOverwrites.set(newPermision[0].newId, channel.permissionOverwrites.get(data.id));
                                channel.permissionOverwrites.map((permisions) => {
                                    if (permisions.id == data.id) {
                                        permisions.id = newPermision[0].newId;
                                    }
                                });
                            });
                        }
                        console.log(channel.permissionOverwrites);
                        if (!targetGuild.channels.cache.find((ch) => ch.name.toLowerCase() == channel.name.toLowerCase()) && channel.type != "category") {
                            targetGuild.channels
                                .create(channel.name, {
                                    permissionOverwrites: channel.permissionOverwrites,
                                    type: channel.type,
                                    position: channel.position,
                                })
                                .then((afterChannel) => {
                                    if (afterChannel.type != "category") {
                                        afterChannel.setParent(parent as discord.CategoryChannel);
                                        afterChannel.overwritePermissions(channel.permissionOverwrites);
                                    }
                                })
                                .catch((err) => console.log(err));
                        }
                    });
                });
            });
        })
        .catch((err) => console.log(err));
};
