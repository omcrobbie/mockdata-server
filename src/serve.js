const jsonServer = require('json-server');
const { outputPath } = require('./paths');
const server = jsonServer.create();
const router = jsonServer.router(outputPath);
const middlewares = jsonServer.defaults({ logger: false });
const { green, yellow, red } = require('chalk');
const morgan = require('morgan');
const { getConfig } = require('./helpers');
const { apiBase } = getConfig('apiBase');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(outputPath);
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
		console.log(req.originalUrl);
		if (req.params.id) {
			const target = db.get('sharedWith').find({ id: req.params.id });
			return res.jsonp(target._data);
		}
		res.jsonp(res.locals.data);
	};
}
