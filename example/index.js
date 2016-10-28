const path = require('path'),
      koala = require('../lib/mr-koala'),
      logger = require('koa-logger');


const mr = koala(
  path.dirname(__filename) + '/api.raml',
  {
      resources: path.dirname(__filename) + '/resources',
      secretKey: 'xxxx'
  }
);


koala.auth.handlers.basic = function(username, password, cb) {
  if (username === 'hoge' && password === 'fuga') {
    return cb(null, {name: 'hoge'});
  }
  return cb(null, false);
}
koala.auth.handlers.digest = function(username, cb) {
  if (username === 'hoge') {
    return cb(null, {name: 'hoge'}, 'fuga');
  }
  return cb(null, false);
};
koala.auth.handlers.jwt = function(jwt_payload, cb) {
  if (jwt_payload.username === 'hoge') {
    return cb(null, {username: 'hoge'});
  }
  return cb(null, false);
};

mr.use(logger());

mr.listen(9000);
