// models/Follow.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Follow extends Model {}

Follow.init(
  {
    // Primary key
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // The ID of the user who is stalking
    follower_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    // The ID of the user who is being stalked
    followed_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'follow',
  }
);

module.exports = Follow;
