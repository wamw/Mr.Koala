const passport = require('koa-passport'),
      BasicStrategy = require('passport-http').BasicStrategy;


passport.use(new BasicStrategy(
  function(username, password, cb) {
    if (username === 'hoge' && password === 'fuga') {
      return cb(null, {name: 'ohtani'});
    }
    return cb(null, false);
  })
);


exports.passport = passport;
exports.middleware = function() {
  return function*(next) {
    const context = this;
    const fn = passport.authenticate('basic', function*(err, user, info, status) {
      if (user === false) {
        context.throw('Error Messageeeeeeeeeeeee', 401);
      }
      return yield* next;
    });

    yield fn.call(this, next);
  }
}
