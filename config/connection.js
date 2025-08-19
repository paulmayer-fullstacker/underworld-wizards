// require("dotenv").config();

// const Sequelize = require("sequelize");

// if (process.env.DB_PASSWORD === "ChangeMe!") {
//   console.error("Please update the .env file with your database password.");
//   process.exit(1);
// }

// const sequelize = process.env.JAWSDB_URL
//   ? new Sequelize(process.env.JAWSDB_URL)
//   : new Sequelize(
//       process.env.DB_DATABASE,
//       process.env.DB_USERNAME,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT,
//         port: process.env.DB_PORT,
//       }
//     );

// module.exports = sequelize;

// Conect Localy or Remotely (Render)
require("dotenv").config();
const Sequelize = require("sequelize");

// Confirm Db connection by logging to console
console.log("--- Database Connection Information ---");
console.log(`DB_DIALECT: ${process.env.DB_DIALECT}`);
console.log(`DB_DATABASE: ${process.env.DB_DATABASE}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log("---------------------------------------");

let sequelize;

if (process.env.DATABASE_URL) {
  // Use the connection string provided by Render
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use separate variables for local development
  sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      port: process.env.DB_PORT,
    }
  );
}

module.exports = sequelize;

