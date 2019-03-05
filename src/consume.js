const fs = require('fs');
const { join } = require('path');
const Promise = require('bluebird');
const { red, green } = require('chalk');
const { getConfig, error, success } = require('./helpers');
const { outputPath, appDirectory } = require('./paths');
const express = require('express');
const agent = require('supertest');

const { routes, apiRouter, apiBase, middleware = [] } = getConfig('routes', 'apiRouter', 'apiBase', 'middleware');
const expressApp = express().use(apiBase, [...middleware, apiRouter]);

function makeRequest ({ route, id = null }) {
	let urlPath = `${apiBase}/${route.url}`;
	if (id) {
		urlPath = `${urlPath}/${id}`;
	}
	return new Promise((resolve, reject) => {
		agent(expressApp)
			.get(urlPath)
			.set(route.headers || {})
			.end((err, res) => {
				const msg = `Fetch from ${urlPath}`;
				if (!err && res.status === 200) {
					console.log(`${msg}: ${green('SUCCESS')}`);
					let payload = res.body;
					if (route.addId) {
						payload = { id, _data: res.body };
					}
					resolve(payload);
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
				let multiple = false;
				if (route.ids) {
					multiple = true;
					fetchPromises = route.ids.map(id => {
						return makeRequest({ route, id }, true);
					});
				} else {
					fetchPromises = [makeRequest({ route })];
				}
				let subroutes = await Promise.all(fetchPromises);
				if (multiple) {
					subroutes = [subroutes];
				}
				if (subroutes) {
					ac[route.path] = subroutes.length > 1 ? subroutes : subroutes[0];
				}
				return ac;
			},
			{}
		);
		if (!Object.keys(dataToWrite).length) {
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
