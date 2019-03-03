const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../apps', `${process.argv[2]}.json`));
const middlewares = jsonServer.defaults();

module.exports = () => {
	server
		.use(middlewares)
		.use(jsonServer.bodyParser)
	// .use(jsonServer.rewriter({
	//     '/oneShow/:id' : 'oneShow'
	// }))
		.use('/api', router)
		.listen(3001, () => {
			console.log('Mock server is listening on port 3001...');
		});
}
