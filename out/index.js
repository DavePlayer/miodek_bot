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
exports.Client = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const express_1 = __importDefault(require("express"));
require("@babel/polyfill");
const dotenv_1 = __importDefault(require("dotenv"));
const userList_1 = __importDefault(require("./userList"));
const startTwitchCheck_1 = require("./startTwitchCheck");
const welcomeUser_1 = require("./welcomeUser");
const rolePunichment_1 = __importDefault(require("./rolePunichment"));
const fs_1 = __importDefault(require("fs"));
const ytMusic_1 = __importDefault(require("./ytMusic"));
const timer_1 = __importDefault(require("./timer"));
const moment_1 = __importDefault(require("moment"));
dotenv_1.default.config();
exports.Client = new discord_js_1.default.Client();
ytMusic_1.default.setClient(exports.Client);
const app = express_1.default();
app.use(express_1.default.json());
const getFileJson = () => {
    return JSON.parse(fs_1.default.readFileSync("./roles.json", "utf-8"));
};
app.post("/send", (req, res) => {
    console.log(req.body);
    // http post body structure
    //{
    //"type": "sendMessage",
    //"channel": "bot",
    //"channelId": 1234567890,
    //"message": "just message"
    //}
    if (req.body.type == "sendMessage" && req.body.channel.length > 0 && req.body.channelId) {
        switch (req.body.channel) {
            case "bot":
                exports.Client.channels.cache.get(process.env.DISCORD_COMMAND_CHANNEL || '').send(req.body.message);
                break;
            case "info-social":
                exports.Client.channels.cache.get(process.env.DISCORD_CHANNEL || '').send(req.body.message);
                break;
            case "ogolny":
                exports.Client.channels.cache.get(process.env.DISCORD_MAIN_CHANNEL || '').send(req.body.message);
                break;
            default:
                exports.Client.channels.cache.get(req.body.channelId).send(req.body.message);
                break;
        }
    }
    res.send({ stsus: "working" });
});
exports.Client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        //Clock.addStaticReminder({time: new Date(2021, 3, 30, 20, 29, 0, 0), func: () => startTwitchCheck(Client) })
        timer_1.default.addStaticReminder({ time: moment_1.default('2021-04-06T19:00:00.000'), func: () => startTwitchCheck_1.startTwitchCheck(exports.Client) });
        timer_1.default.startClock();
        (_a = exports.Client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
            status: "online",
            activity: {
                name: process.env.STATUS,
                type: "PLAYING", //PLAYING: WATCHING: LISTENING: STREAMING:
            },
        });
    }
    catch (err) {
        throw err;
    }
}));
function matchArray(message, matcher) {
    return matcher.some(expr => {
        if (message.match(expr) && message.includes('live')) {
            return true;
        }
    });
}
exports.Client.on("message", (message) => {
    //console.log(message.channel.id)
    const matches = [/kiedy/, /której/, /ktorej/, /kotrej/];
    if (message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes("BOT")) {
        if (matchArray(message.content, matches)) {
            message.channel.send(`\`\`\`json${process.env.REMINDER_MESSAGE}\`\`\``);
        }
        const regex = message.content.match(/BOT (.*)/);
        if (regex != null) {
            const command = regex[1];
            switch (true) {
                case command.includes("save users"):
                    userList_1.default.makeUserList(message, exports.Client);
                    break;
                case command.includes("punish"):
                    const time = command.split(" ");
                    //lastJudgment.punishByRole(Client, message, time[time.length - 1])
                    rolePunichment_1.default.punishInit(exports.Client, message, time[time.length - 1]);
                    //Clock.addDynamicReminder({time: new Date(Date.now() + parseFloat(time[time.length - 1]) * 1000 * 60), func: () => console.log('punish that bitch') })
                    break;
                case command.includes("play"):
                    ytMusic_1.default.playMusic(message);
                    break;
                case command.includes("skip"):
                    ytMusic_1.default.skipSong(message);
                    break;
                case command.includes("show list"):
                    ytMusic_1.default.displayQuerry(message);
                    break;
                case command.includes("fix connection"):
                    ytMusic_1.default.fixConnection(message);
                    break;
                case command.includes("help"):
                    const embeded = new discord_js_1.default.MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("Command list")
                        .setDescription("Wyświetlenie wszelkich komend jakie są w miodku")
                        .addFields({
                        name: "BOT save users",
                        value: "Tworzy listę wszystkich ról użytkowników którzy je posiadają i zapisuje je na serwerze by potem bot mógł je dodać po tym jak osoba wyjdzie i wejdzie",
                    }, {
                        name: "BOT punish @user1 @user2 time+format",
                        value: "dodaje rolę karną dla pingowanych użytkowników na określony czas\n formaty:\n y- lata\n M-miesiąc\nw-tygodnie\nd-dni\nh-godziny\nm-minuty\ns-sekundy\npolecane jest dawanie kar na więcej niż 2 minuty ze względu na timer który sprawdza czas co mitutę, więc dawanie na mniej spowoduje ukaranie użytkownika na zawsze",
                    }, {
                        name: "BOT play youtube_link/custom_words",
                        value: "Dołącza do kanału na którym jest osoba która wpisała komendę i puszcza muzykę w czasie rzeczywistym. w przypadku odtwarzania już jakieś muzyki miodek tworzy listę i dodaję daną muzykę do kolejki by ją później puścić.",
                    }, {
                        name: "BOT skip",
                        value: "W przypadku odtwarzania muzyki na kanale głosowym komenda pomiją odtwarzaną muzykę i w przypadku zaistnienia kolejnej w kolejce, puszcza ją",
                    }, {
                        name: "BOT show list",
                        value: "Pokazuje listę piosenek które mają być puszczone na kanale głosowym.",
                    }, {
                        name: "BOT fix connection",
                        value: "Ponieważ biblioteka discorda jest ułomna i nie umie poprawnie wykryć kiedy bot jest połączony z kanałem głosowym, komenda ta w przypadku zaistnienia błędu przebywania bota na innym kanale programowo wyrzuca bota z danego kanału i czyści kolejkę muzyk.",
                    });
                    message.channel.send(embeded);
                    break;
            }
        }
    }
});
exports.Client.on("guildMemberUpdate", (member) => {
    // niby dziala na kazda zmiane roi, ale tez zmianie pseudonimu jak i usuniecie albo dodanie uzytkownika
    userList_1.default.updateUserList(exports.Client);
});
exports.Client.on("guildMemberAdd", (member) => {
    console.log("welcoming user");
    welcomeUser_1.welcomeUser(member);
    // member.roles.add(member.guild.roles.cache.find(r => r.name == 'debil'))
    // user roles validation and assignment
    getFileJson().users.map((o) => {
        var _a;
        if (typeof o.clientId != "undefined" && o.clientId)
            if (o.clientId == ((_a = member.user) === null || _a === void 0 ? void 0 : _a.id)) {
                o.roles.map((role) => member.roles.add(member.guild.roles.cache.find((r) => r.name == role)));
            }
    });
});
console.log("działa");
exports.Client.login(process.env.TOKEN);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
