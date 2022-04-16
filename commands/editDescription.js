const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("editdescription")
        .setDescription("Edits the default description of signups.")
        .addStringOption(option =>
            option.setName("new_description")
                .setDescription("Put description here.")
                .setRequired(true))
    ],
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        let newDescription = interaction.options.getString("new_description");

        guildInfo[guildId]["description"] = newDescription;

        fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
            if (error) console.error(error);
        });

        try {
            const sent = await interaction.reply(`Description set.`);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000)
        }
    }
}