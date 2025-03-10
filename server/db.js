const { Client } = require('pg');
require('dotenv').config(); // Load environment variables

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database!');

    // Create the users table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return client.query(createTableQuery);
  })
  .then(() => console.log('Users table is ensured to exist'))
  .catch((err) => {
    console.error('Connection error', err.stack);
    process.exit(1); // Exit the application if DB connection fails
  });

module.exports = client;
