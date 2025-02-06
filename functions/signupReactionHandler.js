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
            signups[reaction.emoji.name] = [...new Map([...signups[reaction.emoji.name], { username: user.displayName, id: user.id }].map(usr =>
                [usr["id"], usr])).values()];
        } else if (reaction.emoji.name == "🔀") {
            if (guildInfo[guildId]["views"][message.id] == "role") {
                guildInfo[guildId]["views"][message.id] = "users";
            } else {
                guildInfo[guildId]["views"][message.id] = "role";
            }
            reaction.users.remove(user.id);
        } else {
            reaction.users.remove(user.id);
            return;
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
        if (role) {
            if (!signups[role]) {
                signups[role] = [];
            }
            signups[role] = signups[role].filter(usr => usr.username != user.username);
        }
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

    if (!guildInfo) {
        console.log('Tried to handle a reaction, but guildInfo was empty. Returning.');
        return;
    }

    fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
        if (error) console.error(error);
    })

    let view = guildInfo[guildId]["views"][message.id];
    let users = {};

    let roles = "";
    for (const role in guildInfo[guildId]["roles"]) {
        if (!signups[role]) {
            signups[role] = [];
        }

        let emoji = guildInfo[guildId]["roles"][role];
        let custom_emoji = client.emojis.cache.find(emoji => emoji.name == guildInfo[guildId]["roles"][role]);
        if (custom_emoji) emoji = custom_emoji;
        if (view == "role") {
            roles += `${emoji} __${role}__: ${signups[role].map(
                usr => getDisplayName(message, usr)
            ).join(", ") || ""}\n`;
        } else {
            for (var index in signups[role]) {
                let usr = signups[role][index];
                let displayName = getDisplayName(message, usr)
                if (!users[displayName]) users[displayName] = [];
                users[displayName].push(emoji);
            }
        }
    }

    backups.forEach(bup => {
        signees.delete(bup);
        delete users[bup];
    });

    if (Object.keys(users).length > 0) {
        for (var username in users) {
            roles += `${username}: ${users[username].map(emoji => emoji).join(", ")}\n`;
        }
    }

    let bups = "";
    if (backups.size > 0) {
        bups = `+ ${backups.size}`;
    }

    let backupString = signups["♾️"].map(usr => getDisplayName(message, usr)).join(", ");
    let nopeString = signups["⛔"].map(usr => getDisplayName(message, usr)).join(", ");

    var date = message.content.split('\n')[0].slice(6, 21)
    var description = message.content.split('\n')[1].substring(4).slice(0, -2)
    let schedule = `> __**${date}**__ \n> **${description}**\n Sign up by clicking one of the corresponding reactions!`+
     `Use 🔀 to switch between views. \n[${signees.size}/10] ${bups} \n>>> ${roles}--------------- \n♾️ __Backups__:`+
     ` ${backupString} \n⛔ __Can't make it__: ${nopeString}\n`

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

function getDisplayName(message, usr) {
    return message.guild.members.resolve(usr.id)?.nickname ?? usr.username
}
