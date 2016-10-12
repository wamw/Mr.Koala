const path = require('path'),
      koala = require('../lib/mr-koala'),
      logger = require('koa-logger');

const mr = koala(
  path.dirname(__filename) + '/api.raml',
  {resources: path.dirname(__filename) + '/resources'}
);

mr.use(logger());

mr.listen(9000);
