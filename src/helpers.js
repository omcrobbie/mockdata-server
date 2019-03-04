const { pick } = require('lodash');
const { inputPath } = require('./paths');
const { red, green } = require('chalk');
const appConfig = require(inputPath);

const paramWhitelist = ['middleware']; // properties that do not have to be present in config

function getConfig (...configKeys) {
	const config = pick(appConfig, ...configKeys);
	for (const key of configKeys) {
		if (!config[key] && !paramWhitelist.includes(key)) {
			return error(`Missing value from config: ${key}`);
		}
	}
	return config;
}
function error (msg) {
	console.log(red(msg));
	process.exit(0);
}
function success (msg) {
	console.log(green(msg));
}

module.exports = {
	getConfig,
	error,
	success
};
