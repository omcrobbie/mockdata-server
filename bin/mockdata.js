#!/usr/bin/env node
'use strict';
const spawn = require('cross-spawn');
const script = process.argv[2];

if (script === 'consume' || script === 'serve') {
	spawn.sync('node', [require.resolve(`../src/${script}`)], { stdio: 'inherit' });
} else {
	console.log('Script wrong or undefined: must be "consume" or "serve"');
	process.exit(0);
}
