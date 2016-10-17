const passport = require('koa-passport'),
      http = require('passport-http'),
      jwt = require('passport-jwt'),
      pathToRegexp = require('path-to-regexp');


function defaultHandler(...args) {
  throw new Error('Authentication handler is not implemented.');
}


exports.passport = passport;
exports.handlers = {
  'basic': defaultHandler,
  'digest': defaultHandler,
  'oauth1.0': defaultHandler,
  'oauth2.0': defaultHandler,
  'pathThrough': defaultHandler,
  'jwt': defaultHandler,
  'xOther': defaultHandler
}


const registerStrategyFunctions = {
  'Basic Authentication': function(security) {
    passport.use(new http.BasicStrategy(function(...args) {
      return exports.handlers.basic.apply(this, args);
    }));
  },

  'Digest Authentication': function(security) {
    passport.use(new http.DigestStrategy({ qop: 'auth' }, function(...args) {
      return exports.handlers.digest.apply(this, args);
    }));
  },

  'x-jwt': function(security) {
    const describedBy = security.describedBy;
    const options = {};

    function useDefaultRequestOption(describedBy) {
      if (typeof describedBy !== 'object') return true;
      if (!Object.keys(describedBy).length) return true;
      return false;
    }

    options.secretOrKey = 'secret';
    if (useDefaultRequestOption(describedBy)) {
      // Authorization: JWT <your jwt token>
      options.jwtFromRequest = jwt.ExtractJwt.fromAuthHeader();
    } else if (describedBy.headers) {
      const headers = Object.keys(describedBy.headers);
      if (!headers.length)
        throw new Error(`${describedBy.headers} is not implemented.`);
      switch (headers[0]) {
        case 'Authorization':
          options.jwtFromRequest = jwt.ExtractJwt.fromAuthHeader();
          break;
        default:
          // x-Authorization: <your jwt token>
          options.jwtFromRequest = jwt.ExtractJwt.fromHeader(headers[0].toLowerCase());
          break;
      }
    } else if (describedBy.queryParameters) {
      const queryParameters = Object.keys(describedBy.queryParameters);
      if (!queryParameters.length)
        throw new Error(`${describedBy.queryParameters} is not implemented.`);
      options.jwtFromRequest = jwt.ExtractJwt.fromUrlQueryParameter(queryParameters[0]);
    }

    passport.use(new jwt.Strategy(options, function(...args) {
      return exports.handlers.jwt.apply(this, args);
    }));
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
