'use strict';
const Client = require('.');

// EC2 instance running server.js
let address = "52.32.190.38";
let port = 41234;
let messageCount = 0;

let c = new Client();

let sequence = 0l

c.on('listening', () => {

	c.on('message', (msg, rinfo, length) => {
		console.log("got a message from "+rinfo.address+":"+rinfo.port+" bytes:" + length);
		messageCount += 1;
	});

	setInterval(() => {
		sequence += 1;
		console.log("Sending message to server "+address+":"+port);
		c.send(new Client.Event({
			newState: { value: "one" },
			oldState: { value: "two" },
			sequence: sequence,
			timestamp: 0
		}), address, port, (sendProperties) => {
			console.log(sendProperties);
		});
	}, 1000);

});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});
process.on('exit', () => {
	console.log("client exiting...");
	c.close();
});
