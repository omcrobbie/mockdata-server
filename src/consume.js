const fs = require('fs');
const request = require('request-promise');
const { join } = require('path');
const Promise = require('bluebird');
const { red, green } = require('chalk');

function getInputParams () {
	try {
		const appName = process.argv[2];
		const appConfig = require(join(
			__dirname,
			'../configs',
			`${appName}.json`
		));
		const appFileName = `${appConfig.appName}.json`;
		return { appConfig, appFileName };
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
async function doConsume ({ appConfig, appFileName }) {
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
		fs.writeFileSync(
			join(__dirname, '../apps', appFileName),
			JSON.stringify(dataToWrite),
			{ encoding: 'utf8' }
		);
		console.log(`\nWrote ${green(appFileName)}`);
		process.exit(0);
	} catch (err) {
		console.log(red(err.message));
		process.exit(1);
	}
}
doConsume(getInputParams());
