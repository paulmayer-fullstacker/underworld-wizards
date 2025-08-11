const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = require("../config/connection");

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postedBy: { 
      type: DataTypes.STRING, 
      allowNull: true, 
    },
    user_id: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'user', // References the 'user' table
        key: 'id',
      },
      allowNull: true, 
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);
module.exports = Post;