// models/Like.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

// Create the Like model
class Like extends Model {}

// Define the table columns and configuration
Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // Foreign key that links to the User who liked the post
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user", // References the 'user' table
        key: "id",
      },
      unique: 'unique_like' // This composite key ensures a user can only like a post once
    },
    // Foreign key that links to the Post being liked
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "post", // References the 'post' table
        key: "id",
      },
      unique: 'unique_like' // This composite key ensures a user can only like a post once
    },
  },
  {
    sequelize, // Pass the Sequelize connection instance
    timestamps: true, // This will automatically add `createdAt` and `updatedAt`
    freezeTableName: true,
    underscored: true,
    modelName: "like", // Set the model name
  }
);
module.exports = Like;
