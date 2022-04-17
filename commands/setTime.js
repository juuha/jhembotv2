const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("settime")
        .setDescription("Sets the default start or end time.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("start")
                .setDescription("Sets the default start time.")
                .addStringOption(option =>
                    option
                        .setName("new_starttime")
                        .setDescription("The new start time. Timezone is set to UTC+0. Format: hh:mm (24h time)")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("end")
                .setDescription("Sets the default end time.")
                .addStringOption(option =>
                    option
                        .setName("new_endtime")
                        .setDescription("The new end time. Timezone is set to UTC+0. Format: hh:mm (24h time)")
                        .setRequired(true)
                )
        )

    ],
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        let time = interaction.options._hoistedOptions[0].value;
        let [hours, minutes] = time.split(":", 2);
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if(!validTime(interaction, hours, minutes)) return;

        let milliseconds = hours * 3600000 + minutes * 60000;
        
        let whatTime = "";
        if (interaction.options._subcommand == "start") {
            whatTime = "start time";
            guildInfo[guildId]["startTime"] = milliseconds;
        } else {
            whatTime = "end time";
            guildInfo[guildId]["endTime"] = milliseconds;
        }

        fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
            if (error) console.error(error);
        })
        
        if (minutes == 0) minutes = "00";
        if (hours == 0) hours = "00";

        try {
            await interaction.reply(`Default ${whatTime} set to ${hours}:${minutes}.`);
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000);
        }
        
    }
}

async function validTime(interaction, hours, minutes) {
    if (isNaN(hours) || isNaN(minutes)) {
        try {
            await interaction.reply(`Time was not in format hh:mm, please try again. Example 8PM is 20:00.`);
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000);
        }
        return false;
    }

    if (hours > 23 || minutes > 59) {
        try {
            await interaction.reply(`Hours can't exceed 23 and minutes can't exceed 59.`);
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000);
        }
        return false;
    }
    
    if (hours < 0 || minutes < 0) {
        try {
            await interaction.reply(`Hours or minutes can't be smaller than 0.`);
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000);
        }
        return false;
    }

    return true
}