import fs from "fs";
import ytdl from "ytdl-core";
import node_fetch from "node-fetch";
const fetch = node_fetch;
import discord from "discord.js";
import discordVoice, {
    AudioPlayerStatus,
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    createAudioResource,
    getVoiceConnection,
} from "@discordjs/voice";

class ytMeneger {
    Client: discord.Client | null;
    player: discordVoice.AudioPlayer | null;
    connection: discordVoice.VoiceConnection | null;
    message: discord.CommandInteraction | null;
    querry: Array<any>;
    isPlaying: boolean;
    onChannel: string | null;
    member: discord.GuildMember;

    constructor() {
        this.Client = null;
        this.message = null;
        this.querry = [];
        this.isPlaying = false;
        this.onChannel = null;
        this.player = null;
        this.member = null;
    }

    setClient(Client: discord.Client) {
        this.Client = Client;
    }

    respond(message: discord.Message) {
        message.reply("dddd");
    }

    displayQuerry = (message: discord.Message | discord.CommandInteraction) => {
        if (this.querry.length > 0) {
            let embededList: Array<discord.MessageEmbed> = [];
            this.querry.map((o, i) => {
                console.log(o);
                const embeded = new discord.MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle(i == 0 ? `Playing now: ${o.tittle}` : null || `${i}. ${o.tittle}`)
                    .setImage(o.snippet.thumbnails.default.url);
                if (o.tittle != null) embededList = [...embededList, embeded];
            });
            message.reply({ embeds: embededList });
        } else {
            message.reply(`Querry is empty right now BAKA!!`);
        }
    };

    joinChannel = () => {
        // (this.message!.member!.voice.channel as discord.VoiceChannel)
        //     .join()
        //     .then((o) => resolve((this.connection = o)))
        // .catch((err) => reject(err));
        joinVoiceChannel({
            channelId: this.member.voice.channel.id,
            guildId: this.message.guild.id,
            adapterCreator: this.message.guild.voiceAdapterCreator,
        });
        const Conn = getVoiceConnection(this.member.guild.id);
        Conn.on(VoiceConnectionStatus.Disconnected, () => {
            this.isPlaying = false;
            this.querry = [];
            this.onChannel = null;
        });
        Conn.on(VoiceConnectionStatus.Destroyed, () => {
            this.isPlaying = false;
            this.querry = [];
            this.onChannel = null;
        });
        return (this.connection = Conn);
    };

    fixConnection = (message: discord.Message | discord.CommandInteraction) => {
        this.isPlaying = false;
        this.querry = [];
        this.onChannel = null;

        if (this.connection) this.connection.destroy();

        message.reply(`connection fixed`);
    };

    async menagePlaying() {
        if (this.querry[0]) {
            this.player = createAudioPlayer();
            this.connection.subscribe(this.player);
            const source = ytdl(this.querry[0].url, { filter: "audioonly", quality: "lowestaudio" });
            const resource = createAudioResource(source, { inlineVolume: true });
            resource.volume.setVolume(0.5);
            this.player.play(resource);
            this.player.on(AudioPlayerStatus.Idle, () => {
                if (this.querry.length <= 1) {
                    this.isPlaying = false;
                    this.querry = [];
                } else {
                    this.querry = this.querry.filter((o, i) => (i != 0 ? o : null));
                    this.menagePlaying();
                }
            });
            this.player.on("error", (err) => {
                this.querry = this.querry.filter((o, i) => (i != 0 ? o : null));
                this.message.channel.send({
                    content: `error accured while playing music. skiping song`,
                });
                this.menagePlaying();
                console.log(err);
            });
            // .on("failed", () => {
            //     this.isPlaying = false;
            //     this.querry = [];
            //     this.onChannel = null;
            // });
        }
    }

    skipSong(message: discord.Message | discord.CommandInteraction) {
        if (this.member.voice.channel)
            if (this.member.voice.channel.id == this.onChannel) {
                this.player.stop();
                this.querry = this.querry.filter((o, i) => i != 0 && o);
                console.log(this.querry);
                if (this.querry.length > 0) {
                    message.reply(`skiped song BAKA!!`);
                    this.menagePlaying();
                } else message.reply(`no music in querry BAKA!!`);
            } else message.reply(`you are not on the same channel BAKA!!!`);
        else message.reply(`You are not on any channel BAKA!!!`);
    }

    // any because youtube api json is huge as fuc* and i can't find types for that
    displayMusicInfo(o: any, message?: string) {
        const embeded = new discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(o.items[0].snippet.title)
            .setAuthor(this.message.member.user.username, this.member.user.avatarURL())
            .setDescription(
                o.items[0].snippet.description.length > 2040
                    ? o.items[0].snippet.description.slice(0, 2040)
                    : o.items[0].snippet.description
            )
            .setThumbnail(o.items[0].snippet.thumbnails.medium.url)
            .setTimestamp()
            .setFooter(`author: ${o.items[0].snippet.channelTitle}`);

        this.message.reply({ embeds: [embeded], content: message || null });
    }

    getYtLink = (args: string | Array<string>) =>
        new Promise((res, rej) => {
            const link = (args as Array<string>).join("");
            if (link.includes("youtube.com") && typeof link == "string") {
                const videoID = link.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
                fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoID[1]}&key=${process.env.YTAPIKEY}`
                )
                    .then((o) => o.json())
                    .then((o: any) => {
                        if (!o.error)
                            if (o.pageInfo.totalResults > 0) {
                                return res(o);
                            } else {
                                rej("invalid link");
                            }
                        else {
                            rej(o.error.message);
                        }
                    });
            } else {
                fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(
                        args as string
                    )}&type=video&key=${process.env.YTAPIKEY}`
                )
                    //url: o.items[0].id.videoId,
                    //tittle: o.items[0].snippet.title,
                    //snippet: o.items[0].snippet,
                    .then((o: any) => o.json())
                    .then((o: any) => {
                        if (o.error) {
                            rej(o.error.message);
                            console.log("YT error", o.error);
                        }
                        res(o);
                    })
                    .catch((err) => rej(err));
            }
        });
    async playMusic(message: discord.CommandInteraction, content: string) {
        this.message = message;
        this.member = message.guild.members.cache.get(message.member.user.id);
        if (this.isPlaying == false) {
            if (!this.member.voice.channelId) return message.reply(`You are not in any channel BAKA!!!`);
            this.getYtLink(content.split(" "))
                //yt api has huge json without types
                .then((o: any) => {
                    this.onChannel = this.member.voice.channel.id;
                    this.isPlaying = true;
                    this.displayMusicInfo(o);
                    const data = {
                        url: o.items[0].id.videoId || o.items[0].id,
                        tittle: o.items[0].snippet.title,
                        snippet: o.items[0].snippet,
                    };
                    this.querry = [data];
                    this.joinChannel();
                    this.menagePlaying();
                })
                .catch((err) => {
                    this.message.reply(`here error madam: ${err}`);
                });
        } else if (this.member.voice.channel.id == this.onChannel) {
            this.getYtLink(content.split(" "))
                .then((o: any) => {
                    this.displayMusicInfo(o, `adding music to querry`);
                    const data = {
                        url: o.items[0].id.videoId || o.items[0].id,
                        tittle: o.items[0].snippet.title,
                        snippet: o.items[0].snippet,
                    };
                    this.querry = [...this.querry, data];
                })
                .catch((err) => {
                    this.message.reply(`${err}`);
                });
        } else message.reply(`I am playing already music on a diffrent channel Baka`);
    }
}

export default new ytMeneger();
function probeAndCreateResource(arg0: discordVoice.AudioResource<null>) {
    throw new Error("Function not implemented.");
}
