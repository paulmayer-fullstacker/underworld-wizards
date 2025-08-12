// models/Comment.js
// Import Model (the base class for all of our models), 
// and DataTypes (object containing all the available data types (like TEXT, INTEGER, etc.), from the sequelize library.
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection'); 

// Create the Comment model
class Comment extends Model {}

// Define the table columns and configuration
Comment.init(
  {
    // Unique identifier for the comment
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // The actual text content of the comment
    comment_text: {
      type: DataTypes.TEXT, // Use TEXT for potentially longer comments
      allowNull: false,
      validate: {
        len: [1], // Comment must have at least one character
      },
    },
    // Foreign key that links to the Post this comment belongs to
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // A comment must belong to a post
      references: {
        model: 'post', // Reference to the table name
        key: 'id',
      },
    },
    // Foreign key that links to the User who made this comment
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // A comment must have an author
      references: {
        model: 'user', // Reference to the table name
        key: 'id',
      },
    },
  },
  {
    // Model configuration options
    sequelize, // Pass the Sequelize connection instance
    timestamps: true, // Add createdOn and updatedOn columns
    freezeTableName: true,
    underscored: true, // Use snake_case for column names (e.g., comment_text, post_id, user_id)
    modelName: 'comment', // Set the model name
  }
);

module.exports = Comment;