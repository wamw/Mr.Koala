const path = require('path'),
      koala = require('../lib/mr-koala'),
      logger = require('koa-logger');


koala.auth.ignores = ['/users/:id'];
koala.auth.method = 'basic';
koala.auth.handler = function(username, password, cb) {
  if (username === 'hoge' && password === 'fuga') {
    return cb(null, {name: 'ohtani'});
  }
  return cb(null, false);
}
// koala.auth.method = 'digest';
// koala.auth.handler = function(username, cb) {
//   if (username === 'hoge') {
//     return cb(null, {name: 'ohtani'}, 'fuga');
//   }
//   return cb(null, false);
// };


const mr = koala(
  path.dirname(__filename) + '/api.raml',
  {resources: path.dirname(__filename) + '/resources'}
);

mr.use(logger());

mr.listen(9000);
