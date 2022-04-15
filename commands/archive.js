const { SlashCommandBuilder } = require('@discordjs/builders');
const guildInfo = require('../guildInfo.json');
const fs = require("fs");

module.exports = {
    data: [new SlashCommandBuilder()
        .setName("archive")
        .setDescription("Archives schedules into #archive channel.")
    ],
    async execute(interaction, client) {
        let archiveChannel = null;
        for (const [id, channel] of interaction.guild.channels.cache) {
            if (channel.name == "archive" && channel.type == "text") {
                archiveChannel = channel;
                break;
            }
        }
        if (!archiveChannel) {
            try {
                archiveChannel = await interaction.guild.createChannel('archive', { type: "text" });
            } catch (error) { console.error(error) };
        }
        await interaction.channel.messages.fetch();
        for (const [msgId, message] of interaction.channel.messages.cache) {
            if (message.author.id != client.user.id || !message.content.startsWith("> __**")) continue

            try {
                await archiveChannel.send(message.content);
            } catch (error) {
                console.error(error);
            } finally {
                try {
                    await message.delete();
                } catch (error) {
                    console.error(error);
                }
            }
        }

        try {
            const sent = await interaction.reply(`Messages archived.`);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 10000)
        }
    }
}