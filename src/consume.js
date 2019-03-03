const fs = require('fs');
const request = require('request-promise');
const { join } = require('path');
const Promise = require('bluebird');
const { red, green } = require('chalk');
const { inputPath, outputPath, appDirectory } = require('./paths');

function getInputParams () {
	try {
		const appConfig = require(inputPath);
		return appConfig;
	} catch (err) {
		console.log('ERROR getting input params: ', err.message);
	}
}
function makeRequest (options) {
	return request(options, (error, response) => {
		const msg = `Fetch from ${options.url}`;
		if (!error && response.statusCode === 200) {
			console.log(`${msg}: ${green('SUCCESS')}`);
		} else {
			console.log(`${msg}: ${red('FAILED')}`);
		}
	});
}
async function doConsume (appConfig) {
	try {
		const dataToWrite = await Promise.reduce(
			appConfig.routes,
			async (ac, route) => {
				let fetchPromises;
				if (route.ids) {
					fetchPromises = route.ids.map(id => {
						const fetchUrl = `${route.url}/${id}`;
						return makeRequest({
							url: fetchUrl,
							headers: route.headers
						});
					});
				} else {
					fetchPromises = [
						makeRequest({ url: route.url, headers: route.headers })
					];
				}
				const subroutes = await Promise.all(fetchPromises);
				ac[route.path] =
					subroutes.length > 1
						? subroutes.map(sr => JSON.parse(sr))
						: JSON.parse(subroutes[0]);
				return ac;
			},
			{}
		);
		const outFolder = join(appDirectory, 'mockdata');
		if (!fs.existsSync(outFolder)) {
			fs.mkdir(outFolder);
		}
		fs.writeFileSync(outputPath,
			JSON.stringify(dataToWrite),
			{ encoding: 'utf8' }
		);
		console.log(`\n${green('Successfully Wrote mock data')}`);
		process.exit(0);
	} catch (err) {
		console.log(red(err.message));
		process.exit(1);
	}
}
doConsume(getInputParams());
