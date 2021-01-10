import fs from 'fs'

export const rolePunish = (Client, users, time) => {
    console.log('punish him', users, time)    

    let punishedUsers = JSON.parse(fs.readFileSync('./punishedUsers.json', 'utf-8'))
    //if(punishedUsers.includes(userName)){
        //console.log('user already punished')
        //return false
    // }
    const json = JSON.parse(fs.readFileSync('./roles.json', 'utf-8'))
    const roles = json[json.length -1]

    const cache = Client.guilds.cache.get(process.env.DISCORD_SERVER_ID).members.cache.forEach( user => {
        if(users.has(user.user.id) ){
            if(punishedUsers.includes(user.user.username)) {
                console.log(`${user.user.username} już nie żyż`)
                return user
            } else {
                user.roles.add(user.guild.roles.cache.find(r => r.name == "Nie żyż"))
                punishedUsers = [...punishedUsers, user.user.username]
                fs.writeFileSync('./punishedUsers.json', JSON.stringify(punishedUsers))
                setTimeout(async () => {
                    console.log('------------\n zwalnianie użytkownika \n')
                    user.roles.remove(user.guild.roles.cache.find(r => r.name == "Nie żyż"))
                    fs.writeFileSync('./punishedUsers.json', JSON.stringify(punishedUsers.filter(o => {
                        if(o != user.user.username) return user
                    }))) 
                    console.log(punishedUsers.filter(o => {
                        if(o != user.user.username) return user
                    }))
                }, parseInt(time) * 1000 * 60)
            }
        } else {
            console.log('sth went wrong')
        }
    })
    console.log(punishedUsers)
}

