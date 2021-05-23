import discord from "discord.js";

export const cloneServer = (serverId: string, message: discord.Message, Client: discord.Client) => {
    Client.guilds
        .fetch(serverId)
        .then((targetGuild: discord.Guild) => {
            // targetGuild.channels.cache.clone()A

            // roles cloning
            const rolesClone = message.guild.roles.cache.clone();

            rolesClone.map((role) => {
                console.log(role.name);
                if (!targetGuild.roles.cache.find((rl) => rl.name.toLowerCase() == role.name.toLowerCase()))
                    targetGuild.roles.create({
                        data: role,
                    });
            });

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
                    }
                    if (!targetGuild.channels.cache.find((ch) => ch.name.toLowerCase() == channel.name.toLowerCase()) && channel.type != "category") {
                        targetGuild.channels
                            .create(channel.name, {
                                permissionOverwrites: channel.permissionOverwrites,
                                type: channel.type,
                                position: channel.position,
                            })
                            .then((afterChannel) => {
                                if (afterChannel.type != "category") afterChannel.setParent(parent as discord.CategoryChannel);
                            });
                    }
                });
            });
        })
        .catch((err) => console.log(err));
};
