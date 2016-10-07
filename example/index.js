const path = require('path'),
      koala = require('../lib/mr-koala');

const mr = koala(
  path.dirname(__filename) + '/api.raml',
  {resources: path.dirname(__filename) + '/resources'}
);

mr.listen(8000);
