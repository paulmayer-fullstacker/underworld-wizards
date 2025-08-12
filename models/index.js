// models/index.js
const Post = require("./Post");
const Category = require("./Category");
const User = require("./User");
const Comment = require("./Comment");
const Like = require("./Like");
const Follow = require('./Follow');

// Define Associations

// Post - Category (Many-to-One)
Post.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Category.hasMany(Post, {
  foreignKey: "category_id",
  as: "posts",
});

// User - Post (One-to-Many)
User.hasMany(Post, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  as: "posts",
});

// Post - User (many-to-One)
Post.belongsTo(User, {
  foreignKey: "user_id", 
  as: "user", 
});

// Post - Comment (One-to-Many)
Post.hasMany(Comment, {
  foreignKey: "post_id", 
  onDelete: "CASCADE",
  as: "comments", 
});

// Comment - Post (Many-to-One)
Comment.belongsTo(Post, {
  foreignKey: "post_id", 
  as: "Post",
});

// User - Comment (One-to-Many)
User.hasMany(Comment, {
  foreignKey: "user_id", 
  onDelete: "CASCADE",
  as: "userComments",
});

// Comment - User (Many-to-One)
Comment.belongsTo(User, {
  foreignKey: "user_id", 
  as: "CommentAuthor",
});

// Post - Like (One-to-Many)
Post.hasMany(Like, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
  as: 'likes', 
});

// User - Like (One-to-Many)
User.hasMany(Like, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

// Like - Post (Many-to-One)
Like.belongsTo(Post, {
  foreignKey: "post_id",
});

// Like - User (Many-to-One)
Like.belongsTo(User, {
  foreignKey: "user_id",
});

// User - Post (Many-to-Many) through the Like model
User.belongsToMany(Post, {
  through: Like,
  foreignKey: "user_id",
  as: "likedPosts",
});

// Post - User (Many-to-Many) through the Like model
Post.belongsToMany(User, {
  through: Like,
  foreignKey: "post_id",
  as: "likers",
});

// User - Follower (Many-to-Many), self-referential
User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followed_id',
});

// Stalker - User (Many-to-Many), through the Follow model
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'follower_id',
});

module.exports = {
  Post,
  Category,
  User,
  Comment,
  Like,
  Follow,
};

