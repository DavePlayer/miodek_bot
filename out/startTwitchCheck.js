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
exports.startTwitchCheck = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const discord_js_1 = __importDefault(require("discord.js"));
const fetch = node_fetch_1.default;
const startTwitchCheck = (Client) => {
    console.log("checking twitch status");
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const json = yield fetch(`https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}?client_id=${process.env.TWITCH_CLIENT_ID}&token=${process.env.TWITCH_TOKEN}&api_version=5`);
        const StreamData = yield json.json();
        if (StreamData.stream) {
            const embeded = new discord_js_1.default.MessageEmbed()
                .setTitle(`${StreamData.stream.channel.game} : ${StreamData.stream.channel.status}`)
                .setColor(0xfa3c87)
                .setURL(`${StreamData.stream.channel.url}`)
                .setImage(`${StreamData.stream.preview.large}`);
            Client.channels.cache
                .get(process.env.DISCORD_CHANNEL)
                .send(`@everyone ${process.env.TWITCH_USERNAME} teraz streamuje`, embeded);
        }
        else {
            Client.channels.cache
                .get(process.env.DISCORD_CHANNEL)
                .send(`@everyone ${process.env.TWITCH_USERNAME} dziś nie streamuje`);
        }
    }), 1000);
};
exports.startTwitchCheck = startTwitchCheck;
