'use strict';

const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const protobuf = require('protocol-buffers');
const fs = require('fs');

const messages = protobuf(fs.readFileSync('./proto/state_response.proto'));


function Client() {
  this.socket = dgram.createSocket('udp4');
	this.socket.on('error', (err) => {
		console.log('error in socket:');
		throw err;
	});
	this.socket.on('message', (msg, rinfo) => {
		this.emit('message', deserialize(msg) );
	});
	this.socket.on('listening', () => {
		this.port = this.socket.address().port;
		this.emit('listening');
	});
	this.socket.bind(() => {
		this.emit('bound');
	});
}

util.inherits(Client, EventEmitter);

Client.prototype.send = function (message, target, port, cb) {
	let buffer = new Buffer(serialize(message));
	console.log('sending buffer: ', buffer.toString('hex'), 0, buffer.length, port, target);
	this.socket.send(buffer, 0, buffer.length, port, target, (err) => {
		if (err) {
			console.log("Encountered error sending message :", message);
			throw err;
		} else {
			this.socket.close();
			cb();
		}
	});
};

Client.prototype.close = function () {
	this.socket.close();
};

function serialize(message) {
	return messages.Event.encode(message);
	//return JSON.stringify(message);
}

function deserialize(message) {
	return messages.Event.decode(message);
	//return JSON.parse(message.toString());
}

module.exports = Client;
