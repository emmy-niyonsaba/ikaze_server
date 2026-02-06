const { Sequelize } = require("sequelize");
require("dotenv").config()

// Use in-memory sqlite for tests, PostgreSQL for production
if (process.env.NODE_ENV === "test") {
  const sequelize = new Sequelize("sqlite::memory:", { logging: false });
  module.exports = sequelize;
} else {
  // For Neon PostgreSQL connection
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure your database connection.");
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  module.exports = sequelize;
}