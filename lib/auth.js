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
  'Basic Authentication': function(security, secretKey) {
    passport.use(new http.BasicStrategy(function(...args) {
      return exports.handlers.basic.apply(this, args);
    }));
  },

  'Digest Authentication': function(security, secretKey) {
    passport.use(new http.DigestStrategy({ qop: 'auth' }, function(...args) {
      return exports.handlers.digest.apply(this, args);
    }));
  },

  'x-jwt': function(security, secretKey) {
    // TODO: typ, alg をraml から指定できるようにする
    // describedBy は undefined か object
    const describedBy = security.describedBy;
    const options = requiredOptions = {
      secretOrKey: secretKey,
      jwtFromRequest: jwt.ExtractJwt.fromAuthHeader()
    };

    if (typeof describedBy === 'object') {
      if (describedBy.headers) {
        const headers = Object.keys(describedBy.headers);
        if (!headers.length)
          throw new Error('describedBy.headers is not implemented.');

        if (headers[0] === 'Authorization') {
          options.jwtFromRequest = jwt.ExtractJwt.fromAuthHeader();
        } else {
          // x-Authorization: <your jwt token>
          // passport-jwt は Authorization Header を小文字にしないと動かない
          options.jwtFromRequest = jwt.ExtractJwt.fromHeader(headers[0].toLowerCase());
        }

      } else if (describedBy.queryParameters) {
        const queryParameters = Object.keys(describedBy.queryParameters);
        if (!queryParameters.length)
          throw new Error('describedBy.queryParameters is not implemented.');
        options.jwtFromRequest = jwt.ExtractJwt.fromUrlQueryParameter(queryParameters[0]);
      }
    }

    passport.use(new jwt.Strategy(options, function(...args) {
      return exports.handlers.jwt.apply(this, args);
    }));
  }
}


// HACKME: もっと頑張れる
exports.load = function(raml, secretKey) {
  const securities = raml.securitySchemes().map(function(s) { return s.toJSON(); });

  for (const security of securities) {
    // セキュリティの取得
    const s = security[Object.keys(security)[0]];
    const fn = registerStrategyFunctions[s.type];
    if (!fn) throw new Error(`${s.type} is not implemented`);
    fn(s, secretKey);
  }
}
