const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Removes a role with given name!")
        .addStringOption(option =>
            option.setName("role_name")
                .setDescription("Name of the to-be-removed role.")
                .setRequired(true))
    ],
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        let removedRole = interaction.options.getString("role_name");
        if (guildInfo[guildId]["roles"][removedRole]) {
            let emoji = guildInfo[guildId]["roles"][removedRole];
            let custom_emoji = client.emojis.cache.find(emoji => emoji.name == guildInfo[guildId]["roles"][removedRole]);
            if (custom_emoji) emoji = custom_emoji;
            try {
                delete guildInfo[guildId]["roles"][removedRole];

                if (!guildInfo) {
                    console.log('Tried to remove role, but guildInfo was empty. Returning.');
                    return;
                }

                fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
                    if (error) console.error(error);
                })

                const sent = await interaction.reply(`Role ${removedRole} with emoji ${emoji} removed.`);
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 10000)
            }
        } else {
            try {
                const sent = await interaction.reply(`No role with name ${removedRole} exists.`);
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 10000)
            }
        }
    }
}