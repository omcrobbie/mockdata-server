const jsonServer = require('json-server');
const { outputPath } = require('./paths');
const server = jsonServer.create();
const router = jsonServer.router(outputPath);
const middlewares = jsonServer.defaults({ logger: false });
const { green, yellow, red } = require('chalk');
const morgan = require('morgan');
const { getConfig } = require('./helpers');
const { apiBase } = getConfig('apiBase');

const port = process.argv.slice(2);

setupMorgan();
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
