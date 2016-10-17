const pathToRegexp = require('path-to-regexp');
      router = require('koa-router')();


exports.router = router;

exports.create = function(path, method, resource, auth) {
  exports.router[method](
    path,
    function*(...args) {
      const next = args.pop();

      const r = new resource(this, args);

      // Authentication
      const securedBy = r.getSecuredBy();
      console.log(securedBy);
      if (!securedBy) return yield* next;

      function* callback(err, user, info, status) {
        if (user === false) this.throw('Unauthorized', 401);
        return yield* next;
      }
      yield* auth.passport.authenticate(securedBy, callback.bind(this)).call(this, next);

      yield* next;
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
