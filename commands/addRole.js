const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Starts a role addition process!")
        .addStringOption(option =>
            option.setName("new_role")
                .setDescription("role name to add")
                .setRequired(true))
    ],
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        let newRole = interaction.options.getString("new_role");
        if (guildInfo[guildId]["roles"][newRole]) {
            try {
                let emoji = guildInfo[guildId]["roles"][newRole];
                let custom_emoji = client.emojis.cache.find(emoji => emoji.name == guildInfo[guildId]["roles"][newRole]);
                if (custom_emoji) emoji = custom_emoji;
                const sent = await interaction.reply(`Role ${newRole} already exists with emoji ${emoji}, choose another name for the role or remove old role first.`);
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 2000)                
            }
            return;
        }

        await interaction.reply(`yo`);
    }
}