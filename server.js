'use strict';
const Client = require('.');

console.log(process.argv);

let port = 41234;
let c = new Client(port);
let messageCount = 0;
let clients = [];

c.on('listening', () => {

	console.log("server listening on port "+port+"...");
	c.on('message', (msg, rinfo, length) => {
		let existingClient = clients.find(x => { 
				return x.address === rinfo.address && x.port === rinfo.port;
		});
		if (! existingClient ) {
			console.log("got a subscription from "+rinfo.address+":"+rinfo.port);
			clients.push({
				address:rinfo.address,
				port:rinfo.port,
				messageCount:1,
				bytes:length,
				expectedSequence:0
			});
		} else {
			console.log("message from existing subscription recvd.",
					existingClient.address, existingClient.port);
			existingClient.messageCount += 1;
			existingClient.bytes += length;
			existingClient.expectedSequence += 1;
			if (msg.sequence !== existingClient.expectedSequence) {
				console.log("Messages out of sequence. Expected:"+existingClient.expectedSequence +
						" found: "+msg.sequence);
			}
		}
	});

	setInterval( () => {
		console.log("Clients connected: "+clients.length);
		console.log(JSON.stringify(clients, null, 2));
	}, 5000);

});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});

process.on('exit', () => {
	console.log("server exiting...");
	c.close();
});
