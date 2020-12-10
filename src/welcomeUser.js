export const welcomeUser = member => {

     const welcomeMessages = [
        `Świeże mięso na horyzoncie ${member.user.username}`,
        `Popełnijmy razem przestępstwo podatkowe ${member.user.username}`,
        `Welcome to the cum zone ${member.user.username}`,
        `Brawo! Znalazłeś jeden z lepszych śmietników na tym świecie ${member.user.username}`,
        `GOD IS DED!! GOD WEMEINS DED! AND WE AWD ${member.user.username} HAVE KIWWED HIM! HOW SHAWW WE COMFOWT OWSEWVES! THE MWUWDEWEWS OF AWWW MWUWDEWEWS! `,
    ]
    member.guild.channels.cache.get(process.env.DISCORD_CHANNEL).send(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)])
}
