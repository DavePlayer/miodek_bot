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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class Clock {
    constructor() {
        this.currentTime = moment_1.default();
        this.staticFuns = [];
        this.dynamicFuns = [];
    }
    addStaticReminder(executable) {
        console.log('added static executable function:', executable.time.toString());
        this.staticFuns = [...this.staticFuns, executable];
    }
    addDynamicReminder(executable) {
        console.log('added dynamic executable function');
        this.dynamicFuns = [...this.dynamicFuns, executable];
    }
    startClock() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            this.currentTime = moment_1.default();
            console.log(this.currentTime.toString());
            this.staticFuns.map((exec) => {
                if (this.currentTime.hour() == exec.time.hour() &&
                    this.currentTime.minute() == exec.time.minute()) {
                    exec.func();
                }
            });
            this.dynamicFuns.filter((exec) => {
                this.currentTime.seconds(0).milliseconds(0);
                exec.time.seconds(0).milliseconds(0);
                if (this.currentTime.valueOf() == exec.time.valueOf()) {
                    exec.func();
                    return false;
                }
                else
                    return true;
            });
        }), 60000);
    }
}
exports.default = new Clock();
