module.exports = (interaction, client) => {
    let channelPerms = interaction.channel.permissionOverwrites.cache;
	let perms = channelPerms.filter(permOverwrite => permOverwrite.type == "role")
		.find(permOverwrite => interaction.guild.roles.resolve(permOverwrite.id).name == client.user.username);
	if (!perms) { return false; }
	const flags = [
		"MANAGE_CHANNELS",
		"VIEW_CHANNEL",
		"SEND_MESSAGES",
		"MANAGE_MESSAGES",
		"EMBED_LINKS",
		"READ_MESSAGE_HISTORY",
		"USE_EXTERNAL_EMOJIS",
		"ADD_REACTIONS"
	];
	if (perms.deny.any(flags)) {
		return false;
	} else if (perms.allow.has(flags)) {
		return true;
	} else if (interaction.guild.members.cache.find(usr => usr.id == client.user.id).permissions.has(flags)) {
		return true;
	} else {
        return false;
    }
}
