'use strict';

const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const protobuf = require('protocol-buffers');
const fs = require('fs');
const messages = protobuf(fs.readFileSync('./proto/messages.proto'));

class Client extends EventEmitter {
	constructor(port) {
		super();
		this.socket = dgram.createSocket('udp4');
		this.socket.on('error', (err) => {
			console.log('error in socket:');
			throw err;
		});
		this.socket.on('message', (msg, rinfo) => {
			this.emit('message', deserialize(msg), rinfo);
		});
		this.socket.on('listening', () => {
			this.port = this.socket.address().port;
			this.emit('listening');
		});
		this.socket.bind({port:port}, () => {
			this.emit('bound');
		});
	}

	send(message, target, port, cb) {
		let buffer = new Buffer(serialize(message));
		console.log('sending buffer(hex): ', buffer.toString('hex'), 0, buffer.length, port, target);
		this.socket.send(buffer, 0, buffer.length, port, target, (err) => {
			if (err) {
				console.log("Encountered error sending message :", message);
				throw err;
			} else {
				this.socket.close();
				cb();
			}
		});
	}

	close() { this.socket.close(); }
}

class Event {
	constructor(options) {
		console.log(options);
		this.deviceId = options.deviceId || "";
		this.peripheralId = options.peripheralId || "";
		this.profileId = options.profileId || "";
		this.newState = newValueState(options.newState);
		this.oldState = newValueState(options.oldState);
		this.timestamp = options.timestamp || 0;
	}
}

function serialize(message) {
	return messages.Event.encode(message);
//	return JSON.stringify(message);
}

function deserialize(message) {
	return new Event(messages.Event.decode(message));
//	return JSON.parse(message.toString());
}


function newValueState(options) {
	let state = {};
	console.log(options);
	if (options.value !== undefined) {
		let valueAccessor = isNaN(options.value) ? "string_value" : "double_value";
		state[valueAccessor] = options.value;
	} else {
		if (options.string_value !== undefined) {
			state.value = 
				state.string_value = options.string_value;
		} else if (options.double_value !== undefined) {
			state.value = 
				state.double_value = options.double_value;
		}
	}
	return state;
}

Client.Event = Event;
module.exports = Client;
