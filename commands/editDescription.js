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
        
    }
}