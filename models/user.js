// models/user.js
// Define the User model, which creates a user table in your database. It also adds methods for handling password security

// Sequelize imported here specifically for its NOW method
const { Model, Sequelize, DataTypes } = require("sequelize");
// Imports the bcrypt library, used for hashing and comparing passwords
const bcrypt = require("bcrypt");
// Import the configured database connection
const sequelize = require("../config/connection");
// Create the User class, which inherits from Model
class User extends Model {
  checkPassword(loginPw) {
    // Compare loginPw (plain-text pw from the login form), with this.password (the hashed password stored in the database for the user)
    return bcrypt.compareSync(loginPw, this.password);
  }
}

User.init(
  // Define the columns for the user table
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8],
      },
    },
    createdOn: {  // !! createdOn. NOT createdAT !! 
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    // Hooks: functions that run automatically at specific points (beforeCreate, beforeUpdate)
    hooks: {
      // Run before a new user is created in the database
      beforeCreate: async (newUserData) => {
        // Take the plain-text password from the newUserData object, hash it using bcrypt.hash. Replace the plain-text password with the hashed version, and save it.
        // The 10 is the "salt rounds," which determines how much processing is done to hash the password. 
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        // Return the user data object with the newly hashed password.
        return newUserData;
      },
      // Run before an existing user is updated. If a user changes their password, it will also be securely hashed before being saved (as above).
      beforeUpdate: async (updatedUserData) => {
        updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
        return updatedUserData;
      },
    // Configuration options
    },
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "user",
  }
);
// Export User model
module.exports = User;
