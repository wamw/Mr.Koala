const auth = require('./auth.js'),
      pathToRegexp = require('path-to-regexp'),
      router = require('koa-router')();


exports.router = router;

exports.set = function(path, method, resource) {
  exports.router[method](
    path,
    function*(...args) {
      const next = args.pop();

      const r = new resource(this, args);

      // Authentication
      let securedBy = r.getSecuredBy();
      if (!securedBy.length) return yield* next;
      if (securedBy.indexOf(null) >= 0) return yield* next;
      securedBy = securedBy.map(function(value) { return value.toLowerCase(); });

      function* callback(err, user, info, status) {
        if (err) this.throw('Internal Server Error', 500);
        if (!user) this.throw('Unauthorized', 401);
        return yield* next;
      }
      yield* auth.passport.authenticate(securedBy, callback.bind(this)).call(this, next);

      return yield* next;
    },
    function*(...args) {
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
    }
  );
}
