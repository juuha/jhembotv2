const guildInfo = require('../guildInfo.json')

module.exports = async (client, reaction) => {
    const msg = await reaction.message.fetch();
    let signees = new Set();
    let backups = new Set();
    let removees = new Set();
    guildId = msg.guild.id;
    let signups = initSignups(guildInfo, guildId);

    for (var [id, reaction] of msg.reactions.cache) {
        for (var [id, user] of await reaction.users.fetch()) {
            if (user.id == client.user.id) continue;
            var emoji = "";
            for (role in guildInfo[guildId]["roles"]){
                if (reaction.emoji.name == guildInfo[guildId]["roles"][role]) {
                    emoji = role;
                    signees.add(user.username);
                    signups[role] = [...signups[role], user.username];
                    if (backups.has(user.username)) {
                        backups.delete(user.username);
                    }
                    break;
                }
            }
            if (reaction.emoji.name == "♾️"){
                emoji = "extra";
                signups[emoji] = [...signups[emoji], user.username];
                if (!signees.has(user.username)){
                    backups.add(user.username);
                }
            } else if (reaction.emoji.name == "⛔") {
                emoji = "no";
                signups[emoji] = [...signups[emoji], user.username];
                removees.add(user.username);
            }
            if (emoji == "") reaction.remove(user)
            if (!signups[emoji]) {
                signups[emoji] = user.username;
            }
        }
    }
    var currentSignUps = guildInfo[guildId][signups][msg.id];
    console.log(currentSignUps)
}

function initSignups(guildInfo, guildId) {
    let signups = {}
    for (var role in guildInfo[guildId]["roles"]){
        signups[role] = [];
    }
    signups["extra"] = [];
    signups["no"] = [];
    return signups;
}