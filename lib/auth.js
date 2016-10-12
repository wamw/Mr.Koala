const passport = require('koa-passport'),
      http = require('passport-http'),
      pathToRegexp = require('path-to-regexp');


exports.passport = passport;
exports.method = null;
exports.ignores = [];
const methods = ['basic', 'digest', 'oauth1', 'oauth2'];


exports.handler = function(...args) {
  throw new Error('Authentication handler is not implemented.');
}


passport.use(new http.BasicStrategy(function(...args) {
  return exports.handler.apply(this, args);
}));


passport.use(new http.DigestStrategy({ qop: 'auth' }, function(...args) {
  return exports.handler.apply(this, args);
}));


exports.middleware = function() {
  return function*(next) {
    if (methods.indexOf(exports.method) === -1) {
      return yield* next;
    }

    // Ignore pathes.
    for (ignore of exports.ignores) {
      let pattern = pathToRegexp(ignore);
      if (pattern.test(this.request.path)) return yield* next;
    }

    const context = this;
    const fn = passport.authenticate(exports.method, function*(err, user, info, status) {
      if (user === false) {
        context.throw('Unauthorized', 401);
      }
      return yield* next;
    });

    yield fn.call(this, next);
  }
}
