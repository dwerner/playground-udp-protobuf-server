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
					//assert.equal(msg.newState.double_value, 1);
					//assert.equal(msg.oldState.double_value, 0);
					assert.equal(msg.newState.value, "one");
					assert.equal(msg.oldState.value, "two");
					done();
					c1.close();
					c2.close();
				});

				c1.send(new Client.Event({
					newState: {
						value: "one"
					},
					oldState: {
						value: "two"
					},
					timestamp: 0
				}), 'localhost', c2.port, () => {});

			});
		});
	});
});
