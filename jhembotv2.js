const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const deployCommands = require('./functions/deployCommands.js')
const initGuild = require('./functions/initGuild.js')
const guildInfo = require('./guildInfo.json');
const signupReactionHandler = require('./functions/signupReactionHandler.js');
const checkPerms = require('./functions/checkPerms');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'REACTION']
});

client.once('ready', async () => {
	client.commands = new Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = await require(`./commands/${file}`);
		for (const data of command.data) {
			client.commands.set(data.name, command)
			console.log(`${data.name} loaded`)
		}
	}

	for (var [id, guild] of client.guilds.cache) {
		initGuild(client, guild);
		//deployCommands(client, guild)

		// cleanup from previous sessions.
		guildInfo[id]["signups"] = {};
		guildInfo[id]["views"] = {};
	}
	console.log('Ready!');
})

client.on('guildCreate', async (guild) => {
	initGuild(client, guild)
	deployCommands(client, guild)
})

client.on('interactionCreate', async (interaction) => {
	if (!checkPerms(interaction, client)) {
		return;
	}

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;
	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})

client.on('messageReactionAdd', async (reaction, user) => {
	const message = await reaction.message.fetch()
	if (message.channel.type == "dm"
		|| message.author.id != client.user.id
		|| message.channel.name == "archive"
		|| user.id == client.user.id) return
	signupReactionHandler(client, reaction, message, user, true)
});

client.on('messageReactionRemove', async (reaction, user) => {
	const message = await reaction.message.fetch()
	if (message.channel.type == "dm"
		|| message.author.id != client.user.id
		|| message.channel.name == "archive"
		|| user.id == client.user.id) return
	signupReactionHandler(client, reaction, message, user, false)
})

client.login(token);