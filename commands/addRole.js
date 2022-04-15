const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Starts a role addition process!")
        .addStringOption(option =>
            option.setName("role_name")
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
                const sent = await interaction.reply(`Role ${newRole} already exists with emoji ${emoji}, choose another name or remove old role first.`);
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
        let emoj = null;
        if (!customEmoji) {
            // Hopefully all emojis.
            let regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
            emoj = givenEmoji.match(regex);
            if (!emoj) {
                try {
                    const sent = await interaction.reply(`No emoji found in \"${givenEmoji}\".`);
                } catch (error) {
                    console.error(error);
                } finally {
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000)
                }
                return;
            }
        }

        if (customEmoji) {
            guildInfo[guildId]["roles"][newRole] = customEmoji.name;
        } else {
            guildInfo[guildId]["roles"][newRole] = emoj[1];
        }
        fs.writeFile("./guildInfo.json", JSON.stringify(guildInfo, null, 4), async (error) => {
            if (error) console.error(error);
        })

        const emoji = customEmoji ? customEmoji : emoj[1];
        try {
            const sent = await interaction.reply(`Role ${newRole} added with emoji ${emoji}.`);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000)
        }
    }
}