import ytdl from "ytdl-core"
import fetch from "node-fetch"
import discord from "discord.js"

class ytMeneger {
    constructor() {
        this.Client = null
        this.dispatcher = null
        this.connection = null
        this.message = null
        this.querry = []
        this.isPlaying = false
        this.onChannel = null
    }

    setClient(Client) {
        this.Client = Client
    }

    respond(message) {
        message.channel.send("dddd")
    }

    displayQuerry = (message) => {
        if (this.querry.length > 0) {
            this.querry.map((o, i) => {
                console.log(o)
                const embeded = new discord.MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle(i == 0 ? `Playing now: ${o.tittle}` : null || `${i}. ${o.tittle}`)
                    .setImage(o.snippet.thumbnails.default.url)
                if (o.tittle != null) message.channel.send(embeded)
            })
        } else {
            message.channel.send(`Querry is empty right now BAKA!!`)
        }
    }

    joinChannel = () =>
        new Promise((resolve, reject) => {
            this.message.member.voice.channel
                .join()
                .then((o) => resolve((this.connection = o)))
                .catch((err) => reject(err))
        })

    fixConnection = (message) => {
        this.isPlaying = false
        this.querry = []
        this.onChannel = null

        if (this.connection) this.connection.disconnect()

        this.message.channel.send(`connection fixed`)
    }

    async menagePlaying(o) {
        this.dispatcher = this.connection
            .play(ytdl(this.querry[0].url, { filter: "audioonly", quality: "lowestaudio" }))
            .on("finish", () => {
                if (this.querry.length <= 1) {
                    this.isPlaying = false
                    this.querry = []
                } else {
                    this.menagePlaying()
                }
                this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
            })
            .on("error", (err) => {
                this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
                this.message.channel.send(`error accured while playing music. skiping song`)
                this.menagePlaying()
                console.log(err)
            })
            .on("disconnect", () => {
                this.isPlaying = false
                this.querry = []
                this.onChannel = null
            })
            .on("failed", () => {
                this.isPlaying = false
                this.querry = []
                this.onChannel = null
            })
    }

    skipSong(message) {
        if (message.member.voice.channel)
            if (message.member.voice.channel.id == this.onChannel) {
                this.dispatcher.end()
                this.querry = this.querry.filter((o, i) => i != 0 && o)
                console.log(this.querry)
                if (this.querry.length > 0) {
                    message.channel.send(`skiped song BAKA!!`)
                    this.menagePlaying()
                } else message.channel.send(`no music in querry BAKA!!`)
            } else message.channel.send(`you are not on the same channel BAKA!!!`)
        else message.channel.send(`You are not on any channel BAKA!!!`)
    }

    displayMusicInfo(o) {
        const embeded = new discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(o.items[0].snippet.title)
            .setAuthor(this.message.member.user.username, this.message.member.user.avatarURL())
            .setDescription(
                o.items[0].snippet.description.length > 2040
                    ? o.items[0].snippet.description.slice(0, 2040)
                    : o.items[0].snippet.description
            )
            .setThumbnail(o.items[0].snippet.thumbnails.medium.url)
            .setTimestamp()
            .setFooter(`author: ${o.items[0].snippet.channelTitle}`)

        this.message.channel.send(embeded)
    }

    getYtLink = (args) =>
        new Promise((res, rej) => {
            const link = args.join("")
            if (link.includes("youtube.com") && typeof link == "string") {
                const videoID = link.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)
                fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoID[1]}&key=${process.env.YTAPIKEY}`
                )
                    .then((o) => o.json())
                    .then((o) => {
                        console.log(o)
                        if (!o.error)
                            if (o.pageInfo.totalResults > 0) {
                                return res(o)
                            } else {
                                rej("invalid link")
                            }
                        else {
                            rej(o.error.message)
                        }
                    })
            } else {
                fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(
                        args
                    )}&type=video&key=${process.env.YTAPIKEY}`
                )
                    //url: o.items[0].id.videoId,
                    //tittle: o.items[0].snippet.title,
                    //snippet: o.items[0].snippet,
                    .then((o) => o.json())
                    .then((o) => {
                        console.log("not error", o.error)
                        if (o.error) rej(o.error.message)
                        res(o)
                    })
                    .catch((err) => rej(err))
            }
        })
    async playMusic(message) {
        this.message = message
        if (this.isPlaying == false) {
            if (!message.member.voice.channel) return message.channel.send(`You rane not in any channel BAKA!!!`)
            this.getYtLink(message.content.split(" ").filter((o, i) => (i > 1 ? o : null)))
                .then((o) => {
                    this.onChannel = message.member.voice.channel.id
                    this.isPlaying = true
                    this.displayMusicInfo(o)
                    const data = {
                        url: o.items[0].id.videoId || o.items[0].id,
                        tittle: o.items[0].snippet.title,
                        snippet: o.items[0].snippet,
                    }
                    this.querry = [data]
                    this.joinChannel()
                        .then((o) => this.menagePlaying(o))
                        .catch((err) => message.channel.send(`error accoured while joining: ${err}`))
                })
                .catch((err) => {
                    this.message.channel.send(`here error madam: ${err}`)
                })
        } else if (message.member.voice.channel.id == this.onChannel) {
            this.getYtLink(message.content.split(" ").filter((o, i) => (i > 1 ? o : null)))
                .then((o) => {
                    message.channel.send(`adding music to querry`)
                    this.displayMusicInfo(o)
                    const data = {
                        url: o.items[0].id.videoId || o.items[0].id,
                        tittle: o.items[0].snippet.title,
                        snippet: o.items[0].snippet,
                    }
                    this.querry = [...this.querry, data]
                })
                .catch((err) => {
                    this.message.channel.send(`${err}`)
                })
        } else message.channel.send(`I am playing already music on a diffrent channel Baka`)
    }
}

export default new ytMeneger()
