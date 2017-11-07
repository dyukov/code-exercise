const r = require('rethinkdbdash');

// Export a function that returns a database client instance with
// connection pool
module.exports = async () => {
  return r({
    host: '127.0.0.1',
    port: 28015,
    pool: true,
    cursor: true,
    silent: true,
  });
};
