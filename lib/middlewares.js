exports.error = function() {
  return function*(next){
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        status: this.status,
        cause: err.name,
        message: err.message,
        errors: err.errors
      };
    }
  }
}
