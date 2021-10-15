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
        console.log("added static time independent executable function:", executable.time.toString());
        this.staticTimeDependentFuns = [...this.staticTimeDependentFuns, executable];
    }
    addStaticTimeIndependentReminder(executable: clockExecutable) {
        console.log("added static time independent executable function:", executable.time.toString());
        this.staticTimeIndependentFuns = [...this.staticTimeDependentFuns, executable];
    }

    addDynamicReminder(executable: clockExecutable) {
        console.log("added dynamic executable function");
        this.dynamicFuns = [...this.dynamicFuns, executable];
    }

    removeDynamicReminder(id: string) {
        console.log(`removing dunamic executable funxtion with id: ${id}`);
        this.dynamicFuns = this.dynamicFuns.filter((exec: clockExecutable) => exec.id != id);
    }

    startClock() {
        setInterval(async () => {
            this.currentTime = moment();
            console.log(this.currentTime.toString());

            this.staticTimeDependentFuns.map((exec: clockExecutable) => {
                if (this.currentTime.hour() == exec.time.hour() && this.currentTime.minute() == exec.time.minute()) {
                    try {
                        exec.func().then((res: (execTime: Moment) => Promise<any>) => res?.(exec.time));
                    } catch (error) {
                        console.log(error);
                    }
                }
            });

            this.staticTimeIndependentFuns.map((exec: clockExecutable) => {
                try {
                    exec.func().then((res?: (execTime: Moment) => Promise<any>) => res?.(exec.time));
                } catch (error) {
                    console.log(error);
                }
            });

            this.dynamicFuns.filter((exec: clockExecutable) => {
                this.currentTime.seconds(0).milliseconds(0);
                exec.time.seconds(0).milliseconds(0);
                if (this.currentTime.valueOf() >= exec.time.valueOf()) {
                    exec.func();
                    return false;
                } else return true;
            });
        }, 30000); // miliseconds 1000ml = 1s
    }
}

export default new Clock();
