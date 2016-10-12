const path = require('path'),
      koala = require('../lib/mr-koala'),
      logger = require('koa-logger');


const mr = koala(
  path.dirname(__filename) + '/api.raml',
  {resources: path.dirname(__filename) + '/resources'}
);


koala.auth.ignores = ['/users/:id'];
koala.auth.handlers.basic = function(username, password, cb) {
  if (username === 'hoge' && password === 'fuga') {
    return cb(null, {name: 'ohtani'});
  }
  return cb(null, false);
}
koala.auth.handlers.digest = function(username, cb) {
  if (username === 'hoge') {
    return cb(null, {name: 'ohtani'}, 'fuga');
  }
  return cb(null, false);
};

mr.use(logger());

mr.listen(9000);
