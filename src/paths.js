const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
	appDirectory,
	inputPath: resolveApp('mockdata.config.js'),
	outputPath: resolveApp('mockdata/data.json')
};
