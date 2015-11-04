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
			this.emit('message', deserialize(msg), rinfo, msg.length);
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
		let buffer = new WireFrame(message).toBuffer();
		
		console.log('sending buffer(hex): ', buffer.toString('hex'), 0, buffer.length, port, target);
		this.socket.send(buffer, 0, buffer.length, port, target, (err) => {
			if (err) {
				console.log("Encountered error sending message :", message);
				throw err;
			} else {
				cb({bytesSent:buffer.length});
			}
		});
	}

	close() { 
		this.socket.close();
	}
}


class WireFrame {
	constructor(message) {
		this.message = message;
	}

	toBuffer() {
		let messageBuffer = serialize(this.message);
		let headerBuffer = messages.Header.encode({length: messageBuffer.length});
		return Buffer.concat([headerBuffer, messageBuffer]);
	}
}

WireFrame.parseFrom = function (buffer) {
	const HEADER_SIZE = 2;

	let headerBytes = buffer.slice(0,HEADER_SIZE);
	let messageBytes = buffer.slice(HEADER_SIZE);

	console.log(headerBytes.toString('hex'), messageBytes.toString('hex'));
	let header = messages.Header.decode(headerBytes);

	// more checking could be done here with a specific look inside Header
	let message = messages.Event.decode(messageBytes);
	return new WireFrame(message);
};

class Event {
	constructor(options) {
		this.deviceId = options.deviceId || "";
		this.peripheralId = options.peripheralId || "";
		this.profileId = options.profileId || "";
		this.newState = newValueState(options.newState);
		this.oldState = newValueState(options.oldState);
		this.timestamp = options.timestamp || 0;
		this.sequence = options.sequence || 0;
	}
}

function serialize(message) {
	if (message instanceof Event) {
		return messages.Event.encode(message);
	}
}

function deserialize(message) {
	let frame = WireFrame.parseFrom(message);
	return new Event(frame.message);
}


function newValueState(options) {
	let state = {};
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
