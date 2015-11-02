'use strict';
const Client = require('.');

console.log(process.argv);

let port = 41234;
let c = new Client(port);

c.on('listening', () => {
	console.log("server listening on port "+port+"...");
	c.on('message', (msg) => {
		console.log("Got message", JSON.stringify(msg,null,2));
		c.send(new Client.Event({
			newState: { value: "one" },
			oldState: { value: "two" },
			timestamp: 0
		}), rinfo.address, rinfo.port, () => {});
	});
});

process.on('exit', () => {
	console.log("server exiting...");
	c.close();
});
