import fs from "fs";

export const welcomeUser = (member) => {
    const welcomeMessages = [
        `Świeże mięso na horyzoncie <@${member.user.id}>`,
        `Popełnijmy razem przestępstwo podatkowe <@${member.user.id}>`,
        `Welcome to the cum zone <@${member.user.id}>`,
        `Brawo! Znalazłeś jeden z lepszych śmietników na tym świecie <@${member.user.id}>`,
        `GOD IS DED!! GOD WEMEINS DED! AND WE AWD <@${member.user.id}> HAVE KIWWED HIM! HOW SHAWW WE COMFOWT OWSEWVES! THE MWUWDEWEWS OF AWWW MWUWDEWEWS! `,
    ];
    let randomNumber = Math.floor(Math.random() * welcomeMessages.length);
    let usedMessages = JSON.parse(
        fs.readFileSync("./usedMessages.json", "utf-8")
    );
    console.log(`rondom number before: ${randomNumber}`);
    if (usedMessages.length >= welcomeMessages.length) usedMessages = [];
    while (
        usedMessages.includes(welcomeMessages[randomNumber]) &&
        usedMessages.length < welcomeMessages.length
    ) {
        randomNumber = Math.floor(Math.random() * welcomeMessages.length);
    }
    console.log(`rondom number after: ${randomNumber}`);
    console.log(usedMessages);
    usedMessages = [...usedMessages, welcomeMessages[randomNumber]];
    fs.writeFileSync("./usedMessages.json", JSON.stringify(usedMessages));
    member.guild.channels.cache
        .get(process.env.DISCORD_WELCOME_CHANNEL)
        .send(welcomeMessages[randomNumber]);
};
