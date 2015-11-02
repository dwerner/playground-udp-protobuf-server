'use strict';
const Client = require('.');

console.log(process.argv);

let port = 41234;
let c = new Client(port);
let messageCount = 0;

c.on('listening', () => {
	console.log("server listening on port "+port+"...");
	c.on('message', (msg, rinfo) => {
		messageCount += 1;
		//console.log("got a message from "+rinfo.address+":"+rinfo.port, JSON.stringify(msg,null,2));
		c.send(new Client.Event({
			newState: { value: "one" },
			oldState: { value: "two" },
			timestamp: 0
		}), rinfo.address, rinfo.port, () => {});
	});
});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});

process.on('exit', () => {
	console.log("server exiting...");
	c.close();
});
