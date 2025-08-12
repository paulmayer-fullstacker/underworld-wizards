// models/post.js
// Defines the Post model, which will create a post table in our database.

// Import Model (the base class for all of our models), 
// and DataTypes (object containing all the available data types (like TEXT, INTEGER, etc.), from the sequelize library.
// Also, import Sequelize, needed to access its utility methods (like Sequelize.NOW)
const { Model, DataTypes, Sequelize } = require("sequelize");
// Import the configured Sequelize database connection (fm: config/connection.js)
const sequelize = require("../config/connection");

class Post extends Model {}
// Initialise the Post model with its column definitions and configuration
Post.init(
  {
    // Primary key for the post table
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // title column
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // content column
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // postedBy column
    postedBy: { 
      type: DataTypes.STRING, 
      allowNull: true, 
    },
    // userId column
    user_id: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'user', // References the 'user' table
        key: 'id',
      },
      allowNull: true, 
    },
    // createdOn column !! Note Not createdAT !!
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  // Configuration options
  {
    sequelize,  // Tells Sequelize to use the connection we imported
    timestamps: false,  // Do not use Sequelize defaults: createdAt and updatedAt
    freezeTableName: true,   // Do not allow Sequelize to rename (pluralise) table names
    underscored: true,  // Use snake case namiing convention
    modelName: "post",
  }
);
// Export Post model
module.exports = Post;