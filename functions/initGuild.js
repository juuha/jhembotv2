const fs = require("fs");
const guildInfo = require("../guildInfo.json");

module.exports = (client, guild) => {
    if (!guildInfo[guild.id]) {
        guildInfo[guild.id] = {};
    }
    if (!guildInfo[guild.id]["roles"]) {
        guildInfo[guild.id]["roles"] = {};
    }
    if (!guildInfo[guild.id]["signups"]) {
        guildInfo[guild.id]["signups"] = {};
    }
    if (!guildInfo[guild.id]["description"]){
        guildInfo[guild.id]["description"] = "Default description";
    }
    if (!guildInfo[guild.id]["startTime"]){
        guildInfo[guild.id]["startTime"] = null;
    }
    if (!guildInfo[guild.id]["endTime"]){
        guildInfo[guild.id]["endTime"] = null;
    }
    if (!guildInfo[guild.id]["defaultView"]) {
        guildInfo[guild.id]["defaultView"] = "role";
    }
    if (!guildInfo[guild.id]["views"]) {
        guildInfo[guild.id]["views"] = {};
    }
    if (!guildInfo) {
        console.log('Tried to initialize guild, but guildInfo was empty. Returning.');
        return;
    }
    fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
        if (error) console.error(error);
    })
}