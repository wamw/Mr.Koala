const koa = require('koa'),
      bodyParser = require('koa-bodyparser'),
      raml = require('raml-1-parser'),
      requireDirectory = require('require-directory'),
      schemas = require('./schema.js'),
      resources = require('./resource.js')
      auth = require('./auth.js'),
      middlewares = require('./middlewares'),
      handler = require('./handler.js');


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
  auth.load(spec);
  schemas.load(spec);
  resources.load(spec);

  const resourcesDir = options.resources;
  if (resourcesDir) requireDirectory(module, resourcesDir);

  for (let r of resources) {
    handler.create(r.path, r.method, r.class, auth);
  }

  app.use(handler.router.routes());
  app.use(handler.router.allowedMethods());

  return app;
}


koala.resources = resources;
koala.auth = auth;
