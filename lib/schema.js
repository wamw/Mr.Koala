class SchemaMap extends Map {
  load(schemas) {
    for (let schema of schemas) {
      this.set(schema.name(), JSON.parse(schema.type()[0]));
    }
  }
}

module.exports = new SchemaMap();
