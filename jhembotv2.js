const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const signupReactionAdd = require('./functions/signupReactionAdd.js')
const deployCommands = require('./functions/deployCommands.js')
const initGuild = require('./functions/initGuild.js')

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
		initGuild(client, guild)
		deployCommands(client, guild)
    }
	console.log('Ready!');
})

client.on('guildCreate', async (guild) => {
	initGuild(client, guild)
	deployCommands(client, guild)
})

client.on('interactionCreate', async (interaction) => {
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

client.on('messageReactionAdd', async(reaction, user) => {
	const msg = await reaction.message.fetch()
	if (msg.channel.type == "dm"
        || msg.author.id != client.user.id
        || msg.channel.name == "archive") return
	// reactions by bot
	if (user.id == client.user.id) {
		return
	}
	signupReactionAdd(client, reaction)
	//console.log(reaction.emoji.name);
});

client.on('messageReactionRemove', async (reaction, user) => {
	// console.log(`reaction by ${user.username} removed`);
	//console.log(reaction.emoji.name);
})

client.login(token);