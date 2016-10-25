class TypeMap extends Map {
  load(raml) {
    for (let type of raml.types()) {
      this.set(type.name(), JSON.parse(type.type()[0]));
    }
  }
}

module.exports = new TypeMap();
