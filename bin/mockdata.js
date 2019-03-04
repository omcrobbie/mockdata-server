#!/usr/bin/env node
'use strict';

const spawn = require('cross-spawn');
const { error } = require('../src/helpers');
const args = require('minimist')(process.argv.slice(2));
const script = args._[0];
const startServer = args.s;
const port = args.p || 3001;

if (script === 'consume') {
	spawn.sync('node', [require.resolve('../src/consume')], { stdio: 'inherit' });
} else if (script === 'serve') {
	// start the base server
	const [command, ...args] = startServer.split(' ');
	spawn(command, args, { stdio: 'inherit' });
	// start the mock server
	spawn.sync('node', [require.resolve('../src/serve'), port], { stdio: 'inherit' });
} else {
	error('Script wrong or undefined: must be "consume" or "serve"');
}
