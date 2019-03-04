const { pick } = require('lodash');
const { inputPath } = require('./paths');
const { red, green } = require('chalk');
const appConfig = require(inputPath);

function getConfig (...configKeys) {
	const config = pick(appConfig, ...configKeys);
	for (const key of configKeys) {
		if (!config[key]) {
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
