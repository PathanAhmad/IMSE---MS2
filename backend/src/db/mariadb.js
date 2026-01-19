// File flow:
// - I create one MariaDB pool for the whole backend.
// - I expose `withConn` for safe connection handling.
// - I expose `withTx` for transactions with commit/rollback.

const mariadb = require("mariadb");
const { config } = require("../config");

// I keep one pool for the whole app.
const pool = mariadb.createPool({
  host: config.mariadb.host,
  port: config.mariadb.port,
  user: config.mariadb.user,
  password: config.mariadb.password,
  database: config.mariadb.database,
  connectionLimit: 10,
  multipleStatements: true
});

async function withConn(fn) {
  // I always release the connection, even on errors.
  const conn = await pool.getConnection();
  
  try {
    return await fn(conn);
  } 
  finally {
    conn.release();
  }
}



async function withTx(fn) {
  return withConn(async function(conn) {
    // I wrap the callback in a transaction so partial writes do not leak out.
    await conn.beginTransaction();
    
    try {
      const result = await fn(conn);
      await conn.commit();
      return result;
    } 
    catch (e) {
      await conn.rollback();
      throw e;
    }
  });
}

module.exports = { pool, withConn, withTx };

