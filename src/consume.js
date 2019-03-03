const fs = require("fs");
const request = require("request-promise");
const join = require("path").join;
const Promise = require("bluebird");

const appName = process.argv[2];

const appConfig = require(join(__dirname, "../configs", `${appName}.json`));
const appFileName = `${appConfig.appName}.json`;
const routes = Promise.map(appConfig.routes, route => {
  return new Promise(resolve => {
    let fetchPromises;
    if (route.ids) {
      fetchPromises = route.ids.map(id => {
        const fetchUrl = `${route.url}/${id}`;
        return request({ url: fetchUrl, headers: route.headers });
      });
    } else {
      fetchPromises = [request({ url: route.url, headers: route.headers })];
    }
    Promise.all(fetchPromises)
      .then(subroutes => {
        resolve({
          [route.path]: subroutes.length > 1 ? subroutes.map(sr => JSON.parse(sr)) : JSON.parse(subroutes[0])
        });
      })
      .catch(err => {
        console.log(err);
        process.exit(1);
      });
  });
});
Promise.all(routes).then((routeData) => {
    const finalData = routeData.reduce((ac, route) => {
        const key = Object.keys(route)[0];
        ac[key] = route[key];
        return ac;
    })
  fs.writeFileSync(join(__dirname, "../apps", appFileName), JSON.stringify(finalData), {encoding: 'utf8'});
  process.exit(0);
});
