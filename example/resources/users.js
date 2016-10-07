const resources = require('../../lib/mr-koala').resources;


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
  * request(context, data) {
    console.log(data);
  }

  * response(context) {
    return {
      id: 99999,
      username: 'jackkkkkkk',
      created_at: '2000-01-01T00:00:00.000',
      updated_at: '2000-01-01T00:00:00.000'
    }
  }
});
