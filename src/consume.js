const fs = require('fs');
const { join } = require('path');
const Promise = require('bluebird');
const { red, green } = require('chalk');
const { getConfig, error, success } = require('./helpers');
const { outputPath, appDirectory } = require('./paths');
const express = require('express');
const agent = require('supertest');

const { routes, apiRouter, apiBase } = getConfig('routes', 'apiRouter', 'apiBase');
const expressApp = express().use(apiBase, apiRouter);

function makeRequest ({ url, headers }) {
	const urlPath = `${apiBase}/${url}`;
	return new Promise((resolve, reject) => {
		agent(expressApp)
			.get(urlPath)
			.set(headers)
			.end((err, res) => {
				const msg = `Fetch from ${urlPath}`;
				if (!err && res.status === 200) {
					console.log(`${msg}: ${green('SUCCESS')}`);
					resolve(res.body);
				} else {
					console.log(`${msg}: ${red('FAILED')}`);
					reject(new Error(`Could not find path: ${urlPath}`));
				}
			});
	});
}
async function doConsume () {
	try {
		const dataToWrite = await Promise.reduce(
			routes,
			async (ac, route) => {
				let fetchPromises;
				if (route.ids) {
					fetchPromises = route.ids.map(id => {
						const fetchUrl = `${route.path}/${id}`;
						return makeRequest({
							url: fetchUrl,
							headers: route.headers
						});
					});
				} else {
					fetchPromises = [
						makeRequest({
							url: route.url,
							headers: route.headers
						})
					];
				}
				const subroutes = await Promise.all(fetchPromises);
				if (subroutes) {
					ac[route.path] =
						subroutes.length > 1
							? subroutes
							: subroutes[0];
				}
				return ac;
			},
			{}
		);
		if (!Object.keys(dataToWrite)) {
			throw new Error('Nothing to write!');
		}
		const outFolder = join(appDirectory, 'mockdata');
		if (!fs.existsSync(outFolder)) {
			fs.mkdir(outFolder);
		}
		fs.writeFileSync(outputPath,
			JSON.stringify(dataToWrite),
			{ encoding: 'utf8' }
		);
		success('Successfully Wrote mock data');
		process.exit(0);
	} catch (err) {
		error(err.message);
	}
}
doConsume();
