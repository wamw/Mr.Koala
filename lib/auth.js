const passport = require('koa-passport'),
      http = require('passport-http'),
      jwt = require('passport-jwt'),
      jwtAuthHeaderParser = require('passport-jwt/lib/auth_header'),
      pathToRegexp = require('path-to-regexp');


function defaultHandler(...args) {
  throw new Error('Authentication handler is not implemented.');
}


exports.passport = passport;
exports.methods = [];
exports.ignores = [];
exports.handlers = {
  'basic': defaultHandler,
  'digest': defaultHandler,
  'oauth1.0': defaultHandler,
  'oauth2.0': defaultHandler,
  'pathThrough': defaultHandler,
  'jwt': defaultHandler,
  'xOther': defaultHandler
}


exports.middleware = function() {
  return function*(next) {
    if (exports.methods.length === 0) return yield* next;

    // Ignore pathes.
    for (ignore of exports.ignores) {
      let pattern = pathToRegexp(ignore);
      if (pattern.test(this.request.path)) return yield* next;
    }

    function* callback(err, user, info, status) {
      if (user === false) this.throw('Unauthorized', 401);
      return yield* next;
    }
    yield passport.authenticate(exports.methods, callback.bind(this)).call(this, next);
  }
}


const registerStrategyFunctions = {
  'Basic Authentication': function(security) {
    passport.use(new http.BasicStrategy(function(...args) {
      return exports.handlers.basic.apply(this, args);
    }));
    exports.methods.push('basic');
  },

  'Digest Authentication': function(security) {
    passport.use(new http.DigestStrategy({ qop: 'auth' }, function(...args) {
      return exports.handlers.digest.apply(this, args);
    }));
    exports.methods.push('digest');
  },

  'x-jwt': function(security) {
    const describedBy = security.describedBy;
    const opts = {};

    opts.secretOrKey = 'secret';
    let auth_scheme = 'JWT';
    if (! describedBy) {
      // Authorization: JWT <your jwt token>
      opts.jwtFromRequest = jwt.ExtractJwt.fromHeaderWithScheme('authorization', auth_scheme);
    } else if (describedBy.headers) {
      for (let key in describedBy.headers) {
        if (describedBy.headers[key].example) { // get auth_scheme from example
          const example = describedBy.headers[key].example;
          auth_params = jwtAuthHeaderParser.parse(example);
          if (auth_params && auth_params.scheme) {
            auth_scheme = auth_params.scheme;
          }
        }
        opts.jwtFromRequest = jwt.ExtractJwt.fromHeaderWithScheme(key.toLowerCase(), auth_scheme);
        break;
      }
    } else if (describedBy.queryParameters) {
      for (let key in describedBy.queryParameters) {
        opts.jwtFromRequest = jwt.ExtractJwt.fromUrlQueryParameter(key);
        break;
      }
    }

    passport.use(new jwt.Strategy(opts, function(...args) {
      return exports.handlers.jwt.apply(this, args);
    }));
    exports.methods.push('jwt');
  }
}


// HACKME: もっと頑張れる
exports.load = function(raml) {
  const securities = raml.securitySchemes().map(function(s) { return s.toJSON(); });

  for (type of raml.securedBy()) {
    let security = getSecurityScheme(type.toJSON(), securities);
    if (!security) throw new Error(`The method name "${method}" is not found.`);

    const fn = registerStrategyFunctions[security.type];
    if (!fn) throw new Error(`${security.type} is not implemented.`);

    fn(security);
  }
}


function getSecurityScheme(method, securities) {
  for (security of securities) {
    if (security[method]) return security[method];
  }
  return undefined;
}
