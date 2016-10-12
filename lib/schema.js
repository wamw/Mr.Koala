class SchemaMap extends Map {
  load(raml) {
    for (let schema of raml.schemas()) {
      this.set(schema.name(), JSON.parse(schema.type()[0]));
    }
  }
}

module.exports = new SchemaMap();
