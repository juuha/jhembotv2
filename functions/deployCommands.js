const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');

module.exports = async (client, guild) => {
	const commands = []
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`../commands/${file}`);
		for (const data of command.data) {
			commands.push(data.toJSON());
		}
	}

	const rest = new REST({ version: '9' }).setToken(token);

	(async () => {
		try {
			await rest.put(
				Routes.applicationGuildCommands(client.user.id, guild.id),
				{ body: commands },
			);

			console.log('Successfully registered application commands.');
		} catch (error) {
			console.error(error);
		}
	})();
}