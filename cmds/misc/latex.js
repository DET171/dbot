module.exports = {
	name: 'latex',
	description: 'Latex gen',
	args: true,
	cooldown: 1,
	execute(message, args, prefix) {
		message.channel.createMessage('http://chart.apis.google.com/chart?cht=tx&chl=' + encodeURIComponent(args.join('')));
	},
};