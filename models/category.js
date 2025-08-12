// Import Model (the base class for all of our models), 
// and DataTypes (object containing all the available data types (like TEXT, INTEGER, etc.), from the sequelize library.
const { Model, DataTypes } = require("sequelize");

// Imports our configured Sequelize connection from the config/connection.js file. This sequelize instance connects our models to the database.
const sequelize = require("../config/connection");

// Set up the Category model, which will create a category table in our database
// From Model, Category inherits all the methods it needs to interact with the database (i.e., create, findAll, update).
class Category extends Model {}

// Define the structure of your database table
Category.init(
  // Define the columns
  {
    category_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  // Configuration options
  {
    sequelize, // Tells Sequelize to use the connection we imported
    timestamps: false,  // Do not use Sequelize defaults: createdAt and updatedAt
    freezeTableName: true, // Do not allow Sequelize to rename (pluralise) table names
    underscored: true,  // Use snake case namiing convention
    modelName: "category",
  }
);

// Export Category model
module.exports = Category;
