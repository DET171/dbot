module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[name]', // <name> is optional (to view all commands, just type !commands)
	cooldown: 0,
	async execute(message, args, prefix) {
		const bot = message.channel.client; // get the client instance
		const dmchannel = await bot.getDMChannel(message.author.id); // get DM Channel of message author
		const data = []; // initialize an empty array
		const { commands } = message.channel.client; // get the commands collection from the client
		if (!args.length) { // check for args
			data.push('Here\'s a list of all my commands:'); // push to array
			data.push(`\`${commands.map(command => command.name).join('`, `')}\``); // map the command collection and join the with ', '
			data.push(`\nYou can send \`${prefix}help <command name>\` to get info on a specific command!`); // push
			/* Eris doesn't support things like `{ split: true }`, so we'll have to use `join('\n')` */
			return dmchannel.createMessage(data.join('\n')) // send to author's DM Channel
				.then((msg) => {
					if (!msg.channel.type === 'dm') return;
					message.channel.createMessage(message.author.mention + ', I\'ve sent you a DM with all my commands!');
					// tell the author we've sent him/her the list of commands
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error); // catch the error to stop bot from crashing
					message.channel.createMessage(message.author.mention + ', it seems like I can\'t DM you! Do you have DMs disabled?');
					// tell the author we couldn't DM him the list of commands
				});
		}
		// code below is for when an argument is received
		const name = args[0].toLowerCase(); // get the argument (a.k.a. the command the user needs help with)
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
		// get the command from the `commands` collection
		if (!command) { // if no such command exists
			return message.channel.createMessage('that\'s not a valid command!'); // return
		}

		data.push(`**Name:** ${command.name}`); // push command name

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`); // push command aliases
		if (command.description) data.push(`**Description:** ${command.description}`); // push command description
		if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``); // push command usage

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`); // push command cooldown (defaults to 3s)

		message.channel.createMessage(data.join('\n')); // send
	},
};