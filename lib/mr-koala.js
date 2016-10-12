const koa = require('koa'),
      route = require('koa-route'),
      bodyParser = require('koa-bodyparser'),
      raml = require('raml-1-parser'),
      requireDirectory = require('require-directory'),
      schemas = require('./schema.js'),
      resources = require('./resource.js')
      auth = require('./auth.js'),
      middlewares = require('./middlewares');


const koala = module.exports = function(filepath, options) {
  // Load RAML File
  const spec = raml.loadRAMLSync(filepath);

  // Create App
  const app = koa();

  // Middlewares
  app.use(auth.passport.initialize());
  app.use(auth.middleware());
  app.use(bodyParser());
  app.use(middlewares.error());

  // TODO: Build app from RAML
  schemas.load(spec.schemas());
  resources.load(spec.allResources());

  const resourcesDir = options.resources;
  if (resourcesDir) requireDirectory(module, resourcesDir);

  for (let r of resources) {
    app.use(createHandler(r.path, r.method, r.class));
  }

  return app;
}


koala.resources = resources;
koala.auth = auth;


function createHandler(path, method, resource) {
  return route[method](path, function *(...args) {
    const next = args.pop();

    const r = new resource(this, args);

    // Resolve uri params
    r.params = yield* r.resolve(this, args);

    // Validate request params
    yield* r.query(this);

    // Validate request body
    yield* r.request(this, this.request.body);

    // Generate response body
    this.body = yield* r.response(this);

    return yield* next;
  })
}
