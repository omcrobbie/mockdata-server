const jsonServer = require('json-server');
const { outputPath } = require('./paths');
const server = jsonServer.create();
const router = jsonServer.router(outputPath);
const middlewares = jsonServer.defaults();
const { green } = require('chalk');

server
	.use(middlewares)
	.use(jsonServer.bodyParser)
// .use(jsonServer.rewriter({
//     '/oneShow/:id' : 'oneShow'
// }))
	.use('/api', router)
	.listen(3001, () => {
		console.log(green('Mock-data server is listening on port 3001...'));
	});
