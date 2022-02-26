module.exports = {
	name: 'ping',
	description: 'ping pong 🏓',
	aliases: ['pong'],
	args: false,
	cooldown: 1,
	execute(message, args, prefix) {
		message.channel.send('Pong!');
	},
};