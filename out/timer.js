"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Clock {
    constructor() {
        this.currentTime = new Date(Date.now());
        this.staticFuns = [];
        this.dynamicFuns = [];
    }
    addStaticReminder(executable) {
        console.log('added static executable function');
        executable.time.setSeconds(0, 0);
        this.staticFuns = [...this.staticFuns, executable];
    }
    addDynamicReminder(executable) {
        console.log('added dynamic executable function');
        executable.time.setSeconds(0, 0);
        this.staticFuns = [...this.staticFuns, executable];
    }
    startClock() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            this.currentTime = new Date(Date.now());
            this.currentTime.setSeconds(0, 0);
            this.staticFuns.map((exec) => {
                if (this.currentTime.getHours() == exec.time.getHours() &&
                    this.currentTime.getMinutes() == exec.time.getMinutes()) {
                    exec.func();
                }
            });
            this.dynamicFuns.filter((exec) => {
                if (this.currentTime == exec.time) {
                    exec.func();
                    return false;
                }
                else
                    return true;
            });
            console.log(this.currentTime);
        }), 60000);
    }
}
exports.default = new Clock();
