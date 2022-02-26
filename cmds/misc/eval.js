module.exports = {
	name: 'eval',
	description: 'evaluates a JS expression',
	args: true,
	usage: '<expression>',
	cooldown: 1,
	execute(message, args, prefix) {
		const expr = args.join(' ');
		if (expr.includes('require')) {
			return message.channel.createMessage('You cannot require anything!');
		}
		try {
			message.channel.createMessage({
				embed: {
					title: `${message.author.username}#${message.author.discriminator} evaluated \`${expr}\``,
					description: `Result:\n\`\`\`\n${eval(expr)}\n\`\`\``,
				},
			});
		}
		catch (err) {
			message.channel.createMessage({
				embed: {
					title: `${message.author.username}#${message.author.discriminator}, an error occurred`,
					description: `Error:\n\`\`\`\n${err}\n\`\`\``,
				},
			});
		}
	},
};