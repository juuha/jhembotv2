const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const descriptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const builders = []
for (let day = 0; day < days.length; day++) {
    builders.push(new SlashCommandBuilder().setName(days[day]).setDescription(`Creates a schedule for next ${descriptions[day]}!`)
    .addStringOption(option =>
        option.setName("schedule_description")
            .setDescription("Optional description to overwrite default description.")
            .setRequired(false))
    );
}
builders.push(new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Creates a schedule for given date.")
    .addStringOption(option =>
        option.setName("schedule_date")
            .setDescription("Date format: YYYY MM DD")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("schedule_description")
            .setDescription("Optional description to overwrite default description.")
            .setRequired(false))
);

module.exports = {
    data: builders,
    async execute(interaction, client) {
        var date = new Date();

        if (interaction.commandName == "schedule") {
            const scheduleDate = interaction.options.getString("schedule_date");
            let timestamp = Date.parse(scheduleDate);
            if (isNaN(timestamp) == false) {
                date = new Date(timestamp);
            } else {
                console.log("bad timestamp")
                try {
                    await interaction.reply(`Given data \"${scheduleDate}\" was not in an appropriate format. YYYY MM DD.`);
                } catch (error) {
                    console.log(error);
                } finally {
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000);
                }
                return;
            }
        } else {
            var week = {
                "mon": 1,
                "tue": 2,
                "wed": 3,
                "thu": 4,
                "fri": 5,
                "sat": 6,
                "sun": 7,
            };

            var day = week[interaction.commandName];
            date.setDate(date.getDate() + (7 - date.getDay()) % 7 + day);
        }

        date = date.toDateString();

        try {
            await interaction.reply(`Creating a schedule.`);
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000);
        }


        const guildId = interaction.guild.id;

        let roles = "";
        let signups = {};
        for (const role in guildInfo[guildId]["roles"]) {
            let emoji = guildInfo[guildId]["roles"][role];
            let custom_emoji = client.emojis.cache.find(emoji => emoji.name == guildInfo[guildId]["roles"][role]);
            if (custom_emoji) emoji = custom_emoji;
            roles += `${emoji} __${role}__:\n`
            signups[role] = [];
        }
        signups["♾️"] = [];
        signups["⛔"] = [];

        let description = guildInfo[interaction.guild.id].description;
        const scheduleDescription = interaction.options.getString("schedule_description");
        if (scheduleDescription) description = scheduleDescription;
        
        schedule = `> __**${date}**__\n> **${description}**\n Sign up by clicking one of the corresponding reactions! \n[0/10] \n>>> ${roles}--------------- \n♾️ __Backups__: \n⛔ __Can't make it__: \n`;
        try {
            const sent = await interaction.channel.send(schedule);
            for (const role in guildInfo[interaction.guild.id]["roles"]) {
                let emoji = guildInfo[interaction.guild.id]["roles"][role];
                let custom_emoji = client.emojis.cache.find(emoji => emoji.name === guildInfo[interaction.guild.id]["roles"][role]);
                if (custom_emoji) emoji = custom_emoji
                try {
                    sent.react(emoji);
                } catch (error) { console.log(error); }
            }
            try {
                sent.react('♾️');
                sent.react('⛔');
            } catch (error) { console.error('One of the emojis failed.') }

            guildInfo[interaction.guild.id]["signups"][sent.id] = signups;
            fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
                if (error) console.error(error);
            })
        } catch (error) { console.log(error); }
    }
}