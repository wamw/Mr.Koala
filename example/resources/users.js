const auth = require('../../lib/mr-koala').auth,
      resources = require('../../lib/mr-koala').resources;


resources.override('/token', 'post', {
  * response(context) {
    return { token: auth.jwtSign({ username: 'hoge' }) };
  }
});


resources.override('/users/:id', 'get', {
  * response(context) {

    return {
      id: 99999,
      username: 'jackkkkkkk',
      created_at: '2000-01-01T00:00:00.000',
      updated_at: '2000-01-01T00:00:00.000'
    }
  }
});


resources.override('/users', 'post', {
  * response(context) {
    context.status = 201;
    return {
      id: 99999,
      username: 'jackkkkkkk',
      created_at: '2000-01-01T00:00:00.000',
      updated_at: '2000-01-01T00:00:00.000'
    }
  }
});
