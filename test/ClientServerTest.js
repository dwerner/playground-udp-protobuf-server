'use strict';
const assert = require('assert');
const Client = require('..');
describe('Client', () => {
	it('should exist', () => {
		assert(!! Client);
	});
	it('should bind to port', (done) => {
		let c = new Client();
		c.on('bound', () => { 
			assert( !isNaN(c.port) );
			assert( c.port > 0 && c.port <= 65535);
			done(); 
		});
	});

	it('should communicate with other clients when targetting them', (done) => {
		let c1 = new Client();
		c1.on('listening', () => {
			let c2 = new Client();
			c2.on('listening', () => {
				c2.on('message', (msg) => {
					console.log(JSON.stringify(msg,null,2));
					assert( msg.newState === 1 && msg.oldState === 0 );
					done();
					c1.close();
					c2.close();
				});

				c1.send({
					deviceId:"",
					peripheralId:"",
					profileId:"",
					newState: {
						double_value: 1
					},
					oldState: {
						double_value: 0
					},
					timestamp: 0
				}, 'localhost', c2.port, () => {});

			});
		});
	});
});
