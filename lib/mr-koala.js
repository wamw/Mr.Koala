const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const raml = require('raml-1-parser');
const requireDirectory = require('require-directory');
const types = require('./type.js');
const resources = require('./resource.js');
const auth = require('./auth.js');
const middlewares = require('./middlewares');
const handler = require('./handler.js');


const koala = module.exports = function(filepath, options) {
  // Load RAML File
  const spec = raml.loadRAMLSync(filepath);

  // Create App
  const app = koa();

  // Middlewares
  app.use(auth.passport.initialize());
  app.use(bodyParser());
  app.use(middlewares.error());

  // TODO: Build app from RAML
  auth.load(spec, options);
  types.load(spec);
  resources.load(spec);

  const resourcesDir = options.resources;
  if (resourcesDir) requireDirectory(module, resourcesDir);

  for (let r of resources) {
    handler.set(r.path, r.method, r.class);
  }

  app.use(handler.router.routes());
  app.use(handler.router.allowedMethods());

  return app;
}


koala.resources = resources;
koala.auth = auth;
