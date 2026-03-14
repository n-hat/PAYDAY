/**
 * dotenv reads .env file and loads DATABASE_URL into process.env
 */
require("dotenv").config();

/**
 * Pool is a connection manager from the pg package.
 * It keeps a pool of database connections ready:
 * This makes it so the app doesn't have to open a new connection on every request.
 */
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Export pool so any other file in the backend can import it and query the database.
 */
module.exports = pool;
