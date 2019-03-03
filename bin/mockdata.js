#!/usr/bin/env node
'use strict';
const spawn = require('cross-spawn');
const script = process.argv[2];
const serverStart = process.argv[3];

if (serverStart) {
	const [command, ...args] = serverStart.split(' ');
	spawn(command, args, { stdio: 'inherit' });
}
if (script === 'consume' || script === 'serve') {
	spawn('node', [require.resolve(`../src/${script}`)], { stdio: 'inherit' });
} else {
	console.log('Script wrong or undefined: must be "consume" or "serve"');
	process.exit(0);
}
