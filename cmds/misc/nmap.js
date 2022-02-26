const { exec } = require('child_process');
const nmap = require('node-nmap');

module.exports = {
	name: 'nmap',
	description: 'nmap command',
	args: true,
	usage: 'domain',
	cooldown: 5,
	async execute(message, args, prefix) {
		let scan = new nmap.NmapScan(args);
		scan.on('complete', (data) => {
			message.channel.send('Output:', {
				name: 'output.json',
				file: JSON.stringify(data),
			});
		});
	},
};