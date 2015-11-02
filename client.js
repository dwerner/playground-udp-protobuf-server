'use strict';
const Client = require('.');

// EC2 instance running server.js
let address = "52.32.190.38";
let port = 41234;
let messageCount = 0;

let c = new Client();

c.on('listening', () => {

	c.on('message', (msg, rinfo) => {
		console.log("got a message from "+rinfo.address+":"+rinfo.port, JSON.stringify(msg,null,2));
		messageCount += 1;
	});

	setTimeout(() => {
		console.log("Sending message to server"+address+":"+port);
		c.send(new Client.Event({
			newState: { value: "one" },
			oldState: { value: "two" },
			timestamp: 0
		}), address, port, () => {});
	}, 1000);

});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});
process.on('exit', () => {
	console.log("client exiting...");
	c.close();
});
