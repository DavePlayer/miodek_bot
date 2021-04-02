import discord from 'discord.js'
import {clockExecutable} from './interfaces'


class Clock {
    staticFuns: Array<clockExecutable>
    dynamicFuns: Array<clockExecutable>
    currentTime: Date

    
    constructor() {
        this.currentTime = new Date(Date.now())
        this.staticFuns = []
        this.dynamicFuns = []
    }

    addStaticReminder(executable:clockExecutable) {
        console.log('added static executable function')
        executable.time.setSeconds(0, 0)
        this.staticFuns = [...this.staticFuns, executable]
    }

    addDynamicReminder(executable:clockExecutable) {
        console.log('added dynamic executable function')
        executable.time.setSeconds(0, 0)
        this.staticFuns = [...this.staticFuns, executable]
    }

    startClock() {
        setInterval(async () => {
            this.currentTime = new Date(Date.now())
            this.currentTime.setSeconds(0, 0)

            this.staticFuns.map( (exec:clockExecutable) => {
                if(
                    this.currentTime.getHours() == exec.time.getHours() &&
                    this.currentTime.getMinutes() == exec.time.getMinutes()){
                        exec.func()
                    }
            } )

            this.dynamicFuns.filter( (exec:clockExecutable) => {
                if(this.currentTime == exec.time) {
                    exec.func()
                    return false
                } else return true
            } )
            
            console.log(this.currentTime)
        }, 60000)
    }
}

export default new Clock()
