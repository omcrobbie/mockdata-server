const fs = require('fs');
const path = require('path');
const { red } = require('chalk');

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
	appDirectory,
	inputPath: resolveApp('mockdata.config.js'),
	outputPath: resolveApp('mockdata/data.json')
};

function resolveApp (relativePath) {
	const foundPath = path.resolve(appDirectory, relativePath);
	if (!fs.existsSync(foundPath)) {
		console.log(red(`${foundPath} does not exist`));
		process.exit(0);
	}
	return foundPath;
}
