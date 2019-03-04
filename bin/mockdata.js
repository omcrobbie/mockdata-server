#!/usr/bin/env node
'use strict';

const spawn = require('cross-spawn');
const { error } = require('../src/helpers');
const script = process.argv[2];
const startServer = process.argv[3];

if (startServer) {
	// start the base server
	const [command, ...args] = startServer.split(' ');
	spawn(command, args, { stdio: 'inherit' });
}

if (script === 'consume' || script === 'serve') {
	spawn.sync('node', [require.resolve(`../src/${script}`)], { stdio: 'inherit' });
} else {
	error('Script wrong or undefined: must be "consume" or "serve"');
}
