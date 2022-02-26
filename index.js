const Eris = require('eris');
require('dotenv').config();
const fs = require('fs');

const prefix = process.env.PREFIX;
const bot = new Eris.Client(`Bot ${process.env.TOKEN}`);
bot.commands = new Eris.Collection();
bot.cooldowns = new Eris.Collection();
const commandFolders = fs.readdirSync('./cmds');

console.log('Loading commands...');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./cmds/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./cmds/${folder}/${file}`);
		bot.commands.set(command.name, command);
		console.log(`${command.name} loaded!`);
	}
}

bot.on('error', (err) => {
	console.error(err);
});

bot.on('ready', () => {
	console.log('Connected');
});

bot.on('messageCreate', (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot || !message.guildID) return;
	message.channel.send = message.channel.createMessage;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command['args'] && !args.length) { // if command requires arguments but no arguments were provided
		let reply = `You didn't provide any arguments, ${message.author.mention}!`;

		if (command.usage) { // if command usage is provided
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.createMessage(reply); // send and stop
	}

	const { cooldowns } = bot; // get the `cooldowns` collection from the client/bot instance

	if (!cooldowns.has(command.name)) { // if the cooldown doesn't have the command
		cooldowns.set(command.name, new Eris.Collection()); // add to collection
	}

	const now = Date.now(); // get current milliseconds elapsed since January 1, 1970 00:00:00 UTC
	const timestamps = cooldowns.get(command.name); // get command from cooldowns
	const cooldownAmount = (command.cooldown || 3) * 1000; // check if there the cooldown duration is provided, if not, take it as 3
	// ^^ convert to ms

	if (timestamps.has(message.author.id)) { // if has author id
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount; // get exp time

		if (now < expirationTime) { // if current time is less than exp time
			const timeLeft = (expirationTime - now) / 1000; // get time left
			return bot.createMessage(message.channel.id, `${message.author.mention}, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
			// ^^ tell author time left before he can reuse command
		}
	}

	timestamps.set(message.author.id, now); // set the timestamp
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); // delete author id from list when time is up

	try {
		command.execute(message, args, prefix); // if all goes well, execute the command
		// ^^ pass the `message`, `args`, and `prefix` variable to the command files
	}
	catch (error) { // catch error to stop bot from crashing
		console.error(error); // log error
		bot.createMessage(message.channel.id, `<@${message.author.id}>, there was an error trying to execute that command!`);
		// tell author there was error executing the command
	}
});

bot.connect();