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

    async menagePlaying() {
        const message = this.message
        try {
            this.connection = await message.member.voice.channel.join()
        } catch (err) {
            message.channel.send(`error accoured: ${err}`)
            console.log(err)
        }
        if (this.querry[0] != "invalid") {
            console.log(this.querry[0].snippet.thumbnails.medium)
            /*const embeded = new discord.MessageEmbed()
                .setColor("#0099ff")
                .setTitle(this.querry[0].tittle)
                .setAuthor(this.message.member.user.username, this.message.member.user.avatarURL())
                .setDescription(this.querry[0].snippet.description)
                .setThumbnail(this.querry[0].snippet.thumbnails.medium.url)
                .setTimestamp()
                .setFooter(`author: ${this.querry[0].snippet.channelTitle}`)

            message.channel.send(embeded)*/
            this.dispatcher = this.connection
                .play(ytdl(this.querry[0].url, { filter: "audioonly" }))
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
                    message.channel.send(`error accured while playing music. skiping song`)
                    this.menagePlaying()
                    console.log(err)
                })
        } else {
            if (this.querry.length <= 1) {
                this.isPlaying = false
                this.querry = []
            } else {
                this.menagePlaying()
            }
            this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
        }
        // this.dispatcher = this.connection.play()
    }

    skipSong(message) {
        if (message.member.voice.channel.id == this.onChannel) {
            this.dispatcher.end()
            this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
            if (this.querry.length > 0) {
                message.channel.send(`skiped song BAKA!!`)
                this.menagePlaying()
            } else message.channel.send(`no music in querry BAKA!!`)
        } else message.channel.send(`you are not on the same channel BAKA!!!`)
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

    async getYtLink(args) {
        const link = args.join("")
        if (link.includes("youtube.com") && typeof link == "string") {
            const videoID = link.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)
            return fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoID[1]}&key=${process.env.YTAPIKEY}`
            )
                .then((o) => o.json())
                .then((o) => {
                    if (o.pageInfo.totalResults > 0) {
                        this.displayMusicInfo(o)
                        return {
                            url: link,
                            tittle: o.items[0].snippet.title,
                            snippet: o.items[0].snippet,
                        }
                    } else this.message.channel.send("invalid link")
                    return "invalid"
                })
        } else {
            return fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(
                    args
                )}&type=video&key=${process.env.YTAPIKEY}`
            )
                .then((o) => o.json())
                .then((o) => {
                    console.log(o.items[0])
                    this.displayMusicInfo(o)
                    return {
                        url: o.items[0].id.videoId,
                        tittle: o.items[0].snippet.title,
                        snippet: o.items[0].snippet,
                    }
                })
        }
    }

    async playMusic(message) {
        console.log(this.isPlaying)
        if (this.isPlaying == false) {
            if (!message.member.voice.channel) return message.channel.send(`You rane not in any channel BAKA!!!`)
            this.message = message
            this.onChannel = message.member.voice.channel.id
            this.isPlaying = true
            this.querry = [await this.getYtLink(message.content.split(" ").filter((o, i) => (i > 1 ? o : null)))]
            this.menagePlaying()
        } else if (message.member.voice.channel.id == this.onChannel) {
            message.channel.send(`adding music to querry`)
            this.message = message
            this.querry = [
                ...this.querry,
                await this.getYtLink(message.content.split(" ").filter((o, i) => (i > 1 ? o : null))),
            ]
        } else message.channel.send(`I am playing already music on a diffrent channel Baka`)
    }
}

export default new ytMeneger()
