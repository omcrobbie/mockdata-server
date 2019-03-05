const fs = require('fs');
const { join } = require('path');
const Promise = require('bluebird');
const { red, green } = require('chalk');
const { getConfig, error, success } = require('./helpers');
const { appDirectory } = require('./paths');
const express = require('express');
const agent = require('supertest');
const { isEmpty } = require('lodash');

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
					const noData = isEmpty(res.body);
					console.log(`${msg}: ${green('SUCCESS')} ${red(noData ? '(No data)' : '')}`);
					let payload = res.body;
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
				if (route.ids) {
					fetchPromises = route.ids.map(id => {
						return makeRequest({ route, id }, true);
					});
				} else {
					fetchPromises = [makeRequest({ route })];
				}
				let subroutes = await Promise.all(fetchPromises);
				if (subroutes) {
					if (!route.ids) {
						ac[route.path] = subroutes[0];
					} else {
						ac[route.path] = route.ids.reduce((acc, id) => {
							acc[id] = subroutes[0];
							return acc;
						}, {});
					}
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
		const outputPath = join(outFolder, 'data.json');
		fs.writeFileSync(outputPath,
			JSON.stringify(dataToWrite),
			{ encoding: 'utf8' }
		);
		success('Successfully wrote mock data');
		process.exit(0);
	} catch (err) {
		error(err.message);
	}
}
doConsume();
