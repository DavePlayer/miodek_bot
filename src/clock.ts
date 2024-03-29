import discord from "discord.js";
import { clockExecutable } from "./interfaces";
import moment, { Moment } from "moment";

class Clock {
    staticTimeDependentFuns: Array<clockExecutable>;
    staticTimeIndependentFuns: Array<clockExecutable>;
    dynamicFuns: Array<clockExecutable>;
    currentTime: Moment;

    constructor() {
        this.currentTime = moment();
        this.staticTimeDependentFuns = [];
        this.staticTimeIndependentFuns = [];
        this.dynamicFuns = [];
    }

    addStaticTimeDependentReminder(executable: clockExecutable) {
        console.log("Clock: added static time independent executable function:", executable.time.toString());
        this.staticTimeDependentFuns = [...this.staticTimeDependentFuns, executable];
    }
    addStaticTimeIndependentReminder(executable: clockExecutable) {
        console.log("Clock: added static time independent executable function:", executable.time.toString());
        this.staticTimeIndependentFuns = [...this.staticTimeIndependentFuns, executable];
    }

    addDynamicReminder(executable: clockExecutable) {
        console.log("Clock: added dynamic executable function");
        this.dynamicFuns = [...this.dynamicFuns, executable];
    }

    removeDynamicReminder(id: string) {
        console.log(`Clock: removing dunamic executable funxtion with id: ${id}`);
        this.dynamicFuns = this.dynamicFuns.filter((exec: clockExecutable) => exec.id != id);
    }

    startClock() {
        setInterval(async () => {
            this.currentTime = moment();
            console.log(this.currentTime.toString());

            this.staticTimeDependentFuns.map(async (exec: clockExecutable) => {
                if (this.currentTime.valueOf() >= exec.time.valueOf()) {
                    try {
                        const res: (execTime: Moment) => Promise<any> = await Promise.resolve(exec.func())
                        res?.(exec.time)
                    } catch (error) {
                        console.log("Error in Clock Independent time function: ", error);
                    }
                }
            });

            this.staticTimeIndependentFuns.map(async (exec: clockExecutable) => {
                try {
                    const res: (execTime: Moment) => Promise<any> = await Promise.resolve(exec.func())
                    res?.(exec.time)
                } catch (error) {
                    console.log("Error in Clock Independent time function: ", error);
                }
            });

            this.dynamicFuns = this.dynamicFuns.filter(async (exec: clockExecutable) => {
                if (this.currentTime.valueOf() >= exec.time.valueOf()) {
                    exec.func();
                    return false;
                } else return true;
            });
        }, 10000); // miliseconds 1000ml = 1s
    }
}

export default new Clock();
