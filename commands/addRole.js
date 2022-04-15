const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");
const { rawListeners } = require('process');

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Starts a role addition process!")
        .addStringOption(option =>
            option.setName("new_role")
                .setDescription("Name of the new role.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("role_emoji")
                .setDescription("Emoji used for the role.")
                .setRequired(true))
    ],
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        let newRole = interaction.options.getString("role_name");
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
                }, 10000)
            }
            return;
        }

        const givenEmoji = interaction.options.getString("role_emoji")
        const emojiStringSplitter = /<(a?):(\w+):(\d+)>/;
        let match = givenEmoji.match(emojiStringSplitter);
        var customEmoji = null;

        if (match) {
            customEmoji = client.emojis.cache.find(emoji => emoji.id == match[3])
        }

        if (customEmoji) {
            // TODO custom emoji found
            console.log('custom', customEmoji)
        } else {
            let regex = /\p{Emoji_Presentation}/gu;
            let emo = givenEmoji.match(regex);
            if (emo) {
                // TODO found regular emoji
                console.log("regular", emo[0])
            }
            // TODO no emoji found
            else console.log("no emoji")
        }

        await interaction.reply(`yo`);
    }
}