// File flow:
// - I read the SQL schema from disk.
// - I return it as a string so MariaDB can execute it.

const fs = require("fs");

function readSchemaSql(schemaSqlPath) {
  // I read the schema from a file so it's easy to keep the DB definition in one place.
  return fs.readFileSync(schemaSqlPath, "utf8");
}

module.exports = { readSchemaSql };

