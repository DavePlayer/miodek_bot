import discord from 'discord.js'
import {clockExecutable} from './interfaces'
import moment, {Moment} from 'moment'


class Clock {
    staticFuns: Array<clockExecutable>
    dynamicFuns: Array<clockExecutable>
    currentTime: Moment

    
    constructor() {
        this.currentTime = moment()
        this.staticFuns = []
        this.dynamicFuns = []
    }

    addStaticReminder(executable:clockExecutable) {
        console.log('added static executable function:', executable.time.toString())
        this.staticFuns = [...this.staticFuns, executable]
    }

    addDynamicReminder(executable:clockExecutable) {
        console.log('added dynamic executable function')
        this.dynamicFuns = [...this.dynamicFuns, executable]
    }

    startClock() {
        setInterval(async () => {
            this.currentTime = moment()
            console.log(this.currentTime.toString())

            this.staticFuns.map( (exec:clockExecutable) => {
                if(
                    this.currentTime.hour() == exec.time.hour() &&
                    this.currentTime.minute() == exec.time.minute()){
                        exec.func()
                    }
            } )

            this.dynamicFuns.filter( (exec:clockExecutable) => {
                this.currentTime.seconds(0).milliseconds(0)
                exec.time.seconds(0).milliseconds(0)
                if(this.currentTime.valueOf() == exec.time.valueOf()) {
                    exec.func()
                    return false
                } else return true
            } )
        }, 60000)
    }
}

export default new Clock()
