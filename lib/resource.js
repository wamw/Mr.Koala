const Ajv = require('ajv'),
      mixin = require('es6-class-mixin'),
      schemas = require('./schema.js');


class ResourceMap {
  constructor() {
    this.dict = {};
  }

  get(path, method) {
    if (!this.dict[path]) this.dict[path] = {};

    method = method.toLowerCase();
    return this.dict[path][method];
  }

  set(path, method, klass) {
    if (!this.dict[path]) this.dict[path] = {};

    method = method.toLowerCase();
    this.dict[path][method] = klass;
    return this;
  }

  override(path, method, obj) {
    const base = this.get(path, method);
    const klass = class extends mixin(base, obj) {};
    this.set(path, method, klass);
    return this;
  }

  delete(path, method) {
    if (!this.dict[path]) return this;

    method = method.toLowerCase();
    delete this.dict[path][method];
    return this;
  }

  *[Symbol.iterator]() {
    for (let path in this.dict) if (this.dict.hasOwnProperty(path)) {
      for (var method in this.dict[path]) if (this.dict[path].hasOwnProperty(method)) {
        yield {
          path: path,
          method: method,
          'class': this.dict[path][method]
        }
      }
    }
  }

  load(resources) {
    for (let resource of resources) {
      // TODO: Exchange {id} -> :id
      let path = normalizeURI(resource.relativeUri().value());
      for (let method of resource.methods()) {
        this.set(path, method.method(), Resource.create(resource, method));
      }
    }
  }
}


function normalizeURI(uri) {
  const pattern = /\{(\w+)\}/;
  return uri.replace(pattern, ':$1');
}


module.exports = list = new ResourceMap();


class Resource {
  constructor(context, params) {
    this.context = context;
  }
  * resolve(context, params) { return params; }
  * query(context) { }
  * request(context, data) { }
  * response(context) { return null; }
}


Resource.create = function (resource, method) {
  const klass = class extends Resource {};
  klass.prototype.response = createResponseHandler(method);

  if (method.body()[0]) {
    klass.prototype.request = createRequestHandler(method);
  }

  return klass;
}

function createResponseHandler(method) {
  // TODO: 200 ~ 399 までのステータスのやつを取ってくる。
  const response = method.responses()[0];
  const status = parseInt(response.code().value());

  // TODO: application/json だけで良い気がする。
  const body = response.body()[0];
  const data = body ? JSON.parse(body.example().value()) : null;
  const headers = response.headers().map(h => {
    return {name: h.name(), value: h.example().value()};
  })

  return function* (context) {
    context.status = status;
    for (let header of headers) context.set(header.name, header.value);
    return data
  }
}


function createRequestHandler(method) {
  // TODO: multipart とかも処理できたら良いな
  const body = method.body()[0];
  const schema = schemas.get(body.schema()[0]);

  return function* (context, data) {
    const ajv = new Ajv();

    // TODO: 都度コンパイルは遅そう。
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      // TODO: エラーを扱いやすい形に整形する
      context.throw(400, 'Validation Error.', {errors: validate.errors});
    }
  }
}
