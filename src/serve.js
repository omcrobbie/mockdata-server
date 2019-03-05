const jsonServer = require('json-server');
const { takeRight } = require('lodash');
const { outputData } = require('./paths');
const server = jsonServer.create();
const router = jsonServer.router(outputData);
const middlewares = jsonServer.defaults({ logger: false });
const { green, yellow, red } = require('chalk');
const morgan = require('morgan');
const { getConfig } = require('./helpers');
const { apiBase } = getConfig('apiBase');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(outputData);
const db = low(adapter);

const port = process.argv.slice(2);

setupMorgan();
setupRouter(router);

server
	.use(middlewares)
	.use(morgan(`${yellow('Used mock')}: :method :url :color-status :response-time`))
	.use(jsonServer.bodyParser)
	.use(apiBase, router)
	.listen(parseInt(port), () => {
		console.log(green(`Mock-data server is listening on port ${port}...`));
	});

function setupMorgan () {
	morgan.token('color-status', (req, res) => {
		if (res.statusCode >= 400) {
			return red(res.statusCode);
		}
		return green(res.statusCode);
	});
}

function setupRouter (router) {
	router.render = (req, res) => {
		const urlParts = req.originalUrl.substr(1).split('/');
		if (urlParts.length > 3) {
			const [ route, id ] = takeRight(urlParts, 2);
			const target = db.get(route).get(id).value();
			if (target) {
				return res.status(200).jsonp(target);
			}
			return res.status(404).jsonp({});
		}
		res.jsonp(res.locals.data);
	};
}
