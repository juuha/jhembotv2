const fs = require("fs");
const guildInfo = require('../guildInfo.json');

module.exports = async (client, reaction, message, user, added) => {
    const guildId = message.guild.id;
    let signups = await initSignups(client, reaction, message);
    if (added) {
        let role = ""

        for (const foundRole in guildInfo[guildId]["roles"]) {
            if (reaction.emoji.name == guildInfo[guildId]["roles"][foundRole]) {
                role = foundRole;
                break;
            }
        }
        if (role) {
            if (!signups[role]) {
                signups[role] = [];
            }
            signups[role] = [...new Map([...signups[role], { username: user.username, id: user.id }].map(usr =>
                [usr["id"], usr])).values()];
        } else if ("♾️⛔".includes(reaction.emoji.name)) {
            signups[reaction.emoji.name] = [...new Map([...signups[reaction.emoji.name], { username: user.username, id: user.id }].map(usr =>
                [usr["id"], usr])).values()];
        } else {
            reaction.users.remove(user.id);
        }
    } else { // reaction was removed
        let role = "";
        for (const foundRole in guildInfo[guildId]["roles"]) {
            if (reaction.emoji.name == guildInfo[guildId]["roles"][foundRole]) {
                role = foundRole;
                break;
            }
        }
        if (!role) {
            if (["⛔", "♾️"].includes(reaction.emoji.name)) {
                role = reaction.emoji.name;
            }
        }
        if (!signups[role]) {
            signups[role] = [];
        }
        signups[role] = signups[role].filter(usr => usr.username != user.username);
    }

    let signees = new Set();
    let backups = new Set();
    let removees = new Set();
    for (const role in signups) {
        signups[role].forEach(usr => {
            switch (role) {
                case "♾️": backups.add(usr.username); break;
                case "⛔": removees.add({ username: usr.username, id: usr.id }); break;
                default: signees.add(usr.username);
            }
        });
    }

    removees.forEach(removedUser => {
        for (var role in signups) {
            if (role == "⛔") continue;
            signups[role] = signups[role].filter(usr => usr.username != removedUser.username);
        }
        for (var [id, reaction] of message.reactions.cache) {
            if (reaction.emoji.name == "⛔") continue;
            reaction.users.remove(removedUser.id);
        }
    })

    guildInfo[guildId]["signups"][message.id] = signups;

    fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
        if (error) console.error(error);
    })

    let roles = "";
    for (const role in guildInfo[guildId]["roles"]) {
        if (!signups[role]) {
            signups[role] = [];
        }

        let emoji = guildInfo[guildId]["roles"][role];
        let custom_emoji = client.emojis.cache.find(emoji => emoji.name == guildInfo[guildId]["roles"][role]);
        if (custom_emoji) emoji = custom_emoji;
        if (roles == "") {
            // roles = `${role}: ${signups[role].map(usr => usr.username).join(", ") || ""}`;
            roles = `${emoji} __${role}__: ${signups[role].map(usr => usr.username).join(", ") || ""}`;
        } else {
            // roles = `${roles} \n${role}: ${signups[role].map(usr => usr.username).join(", ") || ""}`;
            roles = `${roles} \n${emoji} __${role}__: ${signups[role].map(usr => usr.username).join(", ") || ""}`;
        }
    }

    backups.forEach(bup => {
        signees.delete(bup);
    });

    let bups = "";
    if (backups.size > 0) {
        bups = `+ ${backups.size}`;
    }

    let backupString = signups["♾️"].map(usr => usr.username).join(", ");
    let nopeString = signups["⛔"].map(usr => usr.username).join(", ");

    var date = message.content.split('\n')[0].slice(6, 21)
    var description = message.content.split('\n')[1].substring(4).slice(0, -2)
    // let schedule = `> __**${date}**__ \n> **${description}**\n Sign up by clicking one of the corresponding reactions! \n[${signees.size}/10] ${bups} \`\`\`${roles} \nBackups: ${backupString} \n---------------\nCan't make it: ${nopeString}\`\`\``
     let schedule = `> __**${date}**__ \n> **${description}**\n Sign up by clicking one of the corresponding reactions! \n[${signees.size}/10] ${bups} \n>>> ${roles}\n--------------- \n♾️ __Backups__: ${backupString} \n⛔ __Can't make it__: ${nopeString}\n`

    try {
        const edited = await message.edit(schedule);
    } catch (error) { console.log('Error editing message.') }
}

async function initSignups(client, reaction, message) {
    const guildId = message.guild.id;
    let signups = guildInfo[guildId]["signups"][message.id];
    if (signups) return signups;

    signups = {};
    for (var role in guildInfo[guildId]["roles"]) {
        signups[role] = [];
    }
    signups["♾️"] = [];
    signups["⛔"] = [];

    const users = {};

    for (var [reactionId, reaction] of message.reactions.cache) {
        let promisedUsers = new Promise((resolve, reject) => {
            resolve(reaction.users.fetch());
        });
        users[reactionId] = promisedUsers;
    }

    const promises = [];
    for ([key, val] of Object.entries(users)) {
        promises.push(val);
    }

    await Promise.all(promises);

    for (var [reactionId, reaction] of message.reactions.cache) {
        for (var [userId, user] of await Promise.resolve(users[reactionId])) {
            if (userId == client.user.id) continue;
            var emoji = "";
            for (role in guildInfo[guildId]["roles"]) {
                if (reaction.emoji.name == guildInfo[guildId]["roles"][role]) {
                    emoji = role;
                    signups[role] = [...new Map([...signups[role], { username: user.username, id: user.id }].map(usr =>
                        [usr["id"], usr])).values()];
                    break;
                }
            }
            if ("♾️⛔".includes(reaction.emoji.name)) {
                emoji = reaction.emoji.name;
                signups[emoji] = [...new Map([...signups[emoji], { username: user.username, id: user.id }].map(usr =>
                    [usr["id"], usr])).values()];
            }
        }
    }
    return signups;
}

/**
 *  let signups = initSignups(guildInfo, guildId);
 * 
 *  let signees = new Set();
    let backups = new Set();
    let removees = new Set();
    let guildId = message.guild.id;

 
    for (var [id, reaction] of message.reactions.cache) {
        for (var [id, user] of await reaction.users.fetch()) {
            if (user.id == client.user.id) continue;
            var emoji = "";
            for (role in guildInfo[guildId]["roles"]) {
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
            if (reaction.emoji.name == "♾️") {
                emoji = "extra";
                signups[emoji] = [...signups[emoji], user.username];
                if (!signees.has(user.username)) {
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
    var currentSignUps = guildInfo[guildId]["signups"][message.id];
    if (!currentSignUps) {
        currentSignUps = initSignups(guildInfo, guildId);
        guildInfo[guildId]["signups"][message.id] = currentSignUps;
    }
    if (currentSignUps == signups) return
    if (removees.size > 0) {
        for (var [msg_id, reaction] of message.reactions.cache) {
            var reactionUserManager = reaction.users;
            for (var [user_id, user] of reaction.users.cache) {
                if (user.id == client.id) continue;
                if (removees.has(user.username) && reaction.emoji.name != "⛔") {
                    reactionUserManager.remove(user);
                }
            }
        }
    }
    let roles = "";
    for (const role in guildInfo[guildId]["roles"]) {
        if (roles == "") {
            roles = `${role}: ${signups[role] || ""}`;
        } else {
            roles = `${roles} \n${role}: ${signups[role] || ""}`;
        }
    }
    if (!signups["extra"]) signups["extra"] = "";
    if (!signups["no"]) signups["no"] = "";
    if (backups.size > 0) {
        bups = `+ ${backups.size}`;
    } else {
        bups = "";
    }
    var date = message.content.split('\n')[0].slice(6, 21)
    var description = message.content.split('\n')[1].substring(4).slice(0, -2)
    let schedule = `> __**${date}**__ \n> **${description}**\n Sign up by clicking one of the corresponding reactions! \n[${signees.size}/10] ${bups} \`\`\`${roles} \nBackups: ${signups.extra} \n---------------\nCan't make it: ${signups.no}\`\`\``
    try {
        const edited = await message.edit(schedule);
    } catch (error) { console.log('Error editing message.') }
 */