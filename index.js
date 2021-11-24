const { ChatClient } = require('dank-twitch-irc');
require('dotenv').config();

let client = new ChatClient({
	username: 'oura_bot',
	password: process.env.OAUTH,
});

let recent2Messages = [];
let latestPajas = null;
let talkedRecently = new Set();

client.on('ready', () => {
	console.log('Ready!');
});

client.on('PRIVMSG', (message) => {
	console.log(message.messageText);
	console.log(recent2Messages);
	recent2Messages.unshift(message.messageText);
	if (recent2Messages.length > 2) recent2Messages.pop();

	if (message.messageText == 'pajaS 🚨 ALERT' && message.senderUserID == '82008718') {
		let shuffler = false;
		for (let msg of recent2Messages) {
			if (msg.match(/^!shuffle ((\/me|🚨|ALERT|pajaS)\s*){3,}/)) {
				shuffler = true;
			}
		}

		if (shuffler) {
			setTimeout(() => {
				client.say(message.channelName, 'pajaCMON shufflers...');
			}, 1000);
		} else {
			client.me(message.channelName, `PepeA 🚨 ALERT`);
			latestPajas = Date.now();
		}
	}

	if (message.messageText === 'pajaS ?') {
		if (talkedRecently.has(message.senderUserID)) return;

		let nextPaja = latestPajas + 2 * 60 * 60 * 1000;
		let timeLeft = Math.floor((nextPaja - Date.now()) / 1000);

		client.say(message.channelName, `@${message.senderUsername}, PAJAS 🚨 in ${humanizeTime(timeLeft)}`);

		talkedRecently.add(message.senderUserID);
		setTimeout(() => {
			talkedRecently.delete(message.senderUserID);
		}, 5000);
	}

	if (message.messageText === 'PepeA ping?') {
		if (talkedRecently.has(message.senderUserID)) return;

		client.say(message.channelName, `PAJAS pong! ${Date.now() - message.serverTimestamp.getTime()}ms latency`);

		talkedRecently.add(message.senderUserID);
		setTimeout(() => {
			talkedRecently.delete(message.senderUserID);
		}, 5000);
	}
});

client.join('pajlada');
client.connect();

function humanizeTime(seconds) {
	let time = {
		days: Math.floor(seconds / 86400),
		hours: Math.floor((seconds % 86400) / 3600),
		minutes: Math.floor((seconds % 3600) / 60),
		seconds: seconds % 60,
	};

	let timeStrings = [];
	if (time.days > 0) timeStrings.push(`${time.days}d`);
	if (time.hours > 0) timeStrings.push(`${time.hours}h`);
	if (time.minutes > 0) timeStrings.push(`${time.minutes}m`);
	if (time.seconds > 0) timeStrings.push(`${time.seconds}s`);

	return timeStrings.join('');
}
