"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeUser = void 0;
const fs = __importStar(require("fs"));
const welcomeUser = (member) => {
    const welcomeMessages = [
        `Świeże mięso na horyzoncie <@${member.user.id}>`,
        `Popełnijmy razem przestępstwo podatkowe <@${member.user.id}>`,
        `Welcome to the cum zone <@${member.user.id}>`,
        `Brawo! Znalazłeś jeden z lepszych śmietników na tym świecie <@${member.user.id}>`,
        `GOD IS DED!! GOD WEMEINS DED! AND WE AWD <@${member.user.id}> HAVE KIWWED HIM! HOW SHAWW WE COMFOWT OWSEWVES! THE MWUWDEWEWS OF AWWW MWUWDEWEWS! `,
        `<@${member.user.id}> Witaj na tym zacnym serwerze`,
        `<@${member.user.id}>  Uszanowanie`,
        `Uwarzaj <@${member.user.id}>  Administracja czuje strach `,
        `AVE <@${member.user.id}>  KLOCEK DAVE'A Z TOBĄ I DUCHEM TWOIM `,
        `Witaj śmiertelniku <@${member.user.id}>`,
    ];
    let randomNumber = Math.floor(Math.random() * welcomeMessages.length);
    let usedMessages = JSON.parse(fs.readFileSync("./usedMessages.json", "utf-8"));
    if (usedMessages.length >= welcomeMessages.length)
        usedMessages = [];
    while (usedMessages.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random() * welcomeMessages.length);
    }
    usedMessages = [...usedMessages, randomNumber];
    const data = JSON.stringify(usedMessages);
    fs.writeFileSync("./usedMessages.json", data);
    member.guild.channels.cache.get(process.env.DISCORD_WELCOME_CHANNEL).send(welcomeMessages[randomNumber]);
};
exports.welcomeUser = welcomeUser;
