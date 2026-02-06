const { Sequelize } = require("sequelize");
require("dotenv").config()

// Use in-memory sqlite for tests
// if (process.env.NODE_ENV === "test") {
//   const sequelize = new Sequelize("sqlite::memory:", { logging: false });
//   module.exports = sequelize;
// } else {
//   const sequelize = new Sequelize(
//     process.env.DATABASE_NAME,
//     process.env.DB_USERNAME,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST || "localhost",
//       dialect: process.env.DB_DIALECT || "mysql",
//       logging: false,
//       port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
//     }
//   );

//   module.exports = sequelize;
// }





// Use in-memory sqlite for tests
if (process.env.NODE_ENV === "test") {
  const sequelize = new Sequelize("sqlite::memory:", { logging: false });
  module.exports = sequelize;
} else {
  // For Neon PostgreSQL connection
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