const route = require('koa-route');


exports.create = function(path, method, resource) {
  return route[method](path, function*(...args) {
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
