'use strict';
const Client = require('.');

console.log(process.argv);

let port = 41234;
let c = new Client(port);
let messageCount = 0;
let clients = [];

c.on('listening', () => {
	console.log("server listening on port "+port+"...");
	c.on('message', (msg, rinfo) => {
		//console.log("got a message from "+rinfo.address+":"+rinfo.port, JSON.stringify(msg,null,2));
		if (!clients.findIndex(x => x.address === rinfo.address && x.port === rinfo.port)) {
			clients.push({address:rinfo.address, port:rinfo.port});
		}
	});
	setTimeout(() => {
		clients.forEach((client)=>{

			console.log("Sending message to client: "+client.addres+":"+client.port);

			c.send(new Client.Event({
				newState: { value: "one" },
				oldState: { value: "two" },
				timestamp: 0
			}), client.address, client.port, () => {});
		});
	}, 1000);
});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});

process.on('exit', () => {
	console.log("server exiting...");
	c.close();
});
