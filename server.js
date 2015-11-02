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
		if (! clients.findIndex(x => { 
				return x.address === rinfo.address &&
					x.port === rinfo.port;
		}) ) {
			console.log("got a subscription from "+rinfo.address+":"+rinfo.port, JSON.stringify(msg,null,2));
			clients.push({address:rinfo.address, port:rinfo.port});
		}
	});

});

process.on('unhandledException', (err) => {
	console.log("UNHANDLED EXCEPTION:", err);
});

process.on('exit', () => {
	console.log("server exiting...");
	c.close();
});
