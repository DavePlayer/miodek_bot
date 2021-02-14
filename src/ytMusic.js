import ytdl from "ytdl-core"

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
        this.dispatcher = this.connection
            .play(ytdl(this.querry[0]))
            .on("finish", () => {
                if (this.querry.length <= 1) {
                    this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
                    this.isPlaying = false
                    this.querry = []
                } else {
                    this.querry = this.querry.filter((o, i) => (i != 0 ? o : null))
                    console.log(this.querry)
                    this.menagePlaying()
                }
            })
            .on("error", (err) => {
                message.channel.send(`error accured while playing music`)
                console.log(err)
                this.querry = []
                this.isPlaying = false
            })
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

    playMusic(message) {
        console.log(this.isPlaying)
        if (this.isPlaying == false) {
            if (!message.member.voice.channel) return message.channel.send(`You rane not in any channel BAKA!!!`)
            this.onChannel = message.member.voice.channel.id
            this.isPlaying = true
            this.querry = [...message.content.split(" ").filter((o, i) => (i > 1 ? o : null))]
            this.message = message
            this.menagePlaying()
            message.channel.send(`playing music`)
        } else if (message.member.voice.channel.id == this.onChannel) {
            message.channel.send(`adding music to querry`)
            this.querry = [...this.querry, ...message.content.split(" ").filter((o, i) => (i > 1 ? o : null))]
            this.message = message
        } else message.channel.send(`I am playing already music on a diffrent channel Baka`)
    }
}

export default new ytMeneger()
