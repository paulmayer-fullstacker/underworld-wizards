// // models/index.js
// // Import all models
// const Post = require("./Post");
// const Category = require("./Category");
// const User = require("./User");
// const Comment = require("./Comment");
// const Like = require("./Like");
// const Follow = require('./Follow');

// // Define Associations

// // Post - Category (Many-to-One)
// Post.belongsTo(Category, {
//   foreignKey: "category_id",
//   as: "category",
// });

// Category.hasMany(Post, {
//   foreignKey: "category_id",
//   as: "posts",
// });

// // User - Post (One-to-Many)
// User.hasMany(Post, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
//   as: "posts",
// });

// Post.belongsTo(User, {
//   foreignKey: "user_id", 
//   as: "User",
// });

// // Post - Comment (One-to-Many)
// Post.hasMany(Comment, {
//   foreignKey: "post_id", 
//   onDelete: "CASCADE",
//   as: "comments", 
// });

// Comment.belongsTo(Post, {
//   foreignKey: "post_id", 
//   as: "Post",
// });

// // User - Comment (One-to-Many)
// User.hasMany(Comment, {
//   foreignKey: "user_id", 
//   onDelete: "CASCADE",
//   as: "userComments",
// });

// // Comment - User (Many-to-One)
// Comment.belongsTo(User, {
//   foreignKey: "user_id", 
//   as: "CommentAuthor",
// });

// // --- NEW ASSOCIATIONS FOR THE LIKE MODEL AND FOLLOW MODEL---

// // Post - Like (One-to-Many)
// Post.hasMany(Like, {
//   foreignKey: "post_id",
//   onDelete: "CASCADE",
// });

// // User - Like (One-to-Many)
// User.hasMany(Like, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
// });

// // Like - Post (Many-to-One)
// Like.belongsTo(Post, {
//   foreignKey: "post_id",
// });

// // Like - User (Many-to-One)
// Like.belongsTo(User, {
//   foreignKey: "user_id",
// });

// // User - Post (Many-to-Many) through the Like model
// // This is a convenient way to get all the posts a user has liked
// User.belongsToMany(Post, {
//   through: Like,
//   foreignKey: "user_id",
//   as: "likedPosts",
// });

// // Post - User (Many-to-Many) through the Like model
// // This is a convenient way to get all the users who have liked a post
// Post.belongsToMany(User, {
//   through: Like,
//   foreignKey: "post_id",
//   as: "likers",
// });

// // NEW: User and Follower relationships (many-to-many, self-referential)
// User.belongsToMany(User, {
//   through: Follow,
//   as: 'Followers',
//   foreignKey: 'followed_id',
// });

// User.belongsToMany(User, {
//   through: Follow,
//   as: 'Following',
//   foreignKey: 'follower_id',
// });

// module.exports = {
//   Post,
//   Category,
//   User,
//   Comment,
//   Like,
//   Follow,
// };

// // models/index.js
// const Post = require("./Post");
// const Category = require("./Category");
// const User = require("./User");
// const Comment = require("./Comment");
// const Like = require("./Like");
// const Follow = require('./Follow');

// // Define Associations

// // Post - Category (Many-to-One)
// Post.belongsTo(Category, {
//   foreignKey: "category_id",
//   as: "category",
// });

// Category.hasMany(Post, {
//   foreignKey: "category_id",
//   as: "posts",
// });

// // User - Post (One-to-Many)
// User.hasMany(Post, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
//   as: "posts",
// });

// Post.belongsTo(User, {
//   foreignKey: "user_id", 
//   as: "user", //??
// });

// // Post - Comment (One-to-Many)
// Post.hasMany(Comment, {
//   foreignKey: "post_id", 
//   onDelete: "CASCADE",
//   as: "comments", 
// });

// Comment.belongsTo(Post, {
//   foreignKey: "post_id", 
//   as: "Post",
// });

// // User - Comment (One-to-Many)
// User.hasMany(Comment, {
//   foreignKey: "user_id", 
//   onDelete: "CASCADE",
//   as: "userComments",
// });

// // Comment - User (Many-to-One)
// Comment.belongsTo(User, {
//   foreignKey: "user_id", 
//   as: "CommentAuthor",
// });

// // Post - Like (One-to-Many)
// Post.hasMany(Like, {
//   foreignKey: "post_id",
//   onDelete: "CASCADE",
// });

// // User - Like (One-to-Many)
// User.hasMany(Like, {
//   foreignKey: "user_id",
//   onDelete: "CASCADE",
// });

// // Like - Post (Many-to-One)
// Like.belongsTo(Post, {
//   foreignKey: "post_id",
// });

// // Like - User (Many-to-One)
// Like.belongsTo(User, {
//   foreignKey: "user_id",
// });

// // User - Post (Many-to-Many) through the Like model
// User.belongsToMany(Post, {
//   through: Like,
//   foreignKey: "user_id",
//   as: "likedPosts",
// });

// // Post - User (Many-to-Many) through the Like model
// Post.belongsToMany(User, {
//   through: Like,
//   foreignKey: "post_id",
//   as: "likers",
// });

// // User and Follower relationships (many-to-many, self-referential)
// User.belongsToMany(User, {
//   through: Follow,
//   as: 'Followers',
//   foreignKey: 'followed_id',
// });

// User.belongsToMany(User, {
//   through: Follow,
//   as: 'Following',
//   foreignKey: 'follower_id',
// });

// module.exports = {
//   Post,
//   Category,
//   User,
//   Comment,
//   Like,
//   Follow,
// };

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

Post.belongsTo(User, {
  foreignKey: "user_id", 
  as: "user", // FIX: Changed alias to lowercase 'user' for consistency
});

// Post - Comment (One-to-Many)
Post.hasMany(Comment, {
  foreignKey: "post_id", 
  onDelete: "CASCADE",
  as: "comments", 
});

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

// ASSOCIATIONS FOR THE LIKE MODEL AND FOLLOW MODEL

// Post - Like (One-to-Many)
Post.hasMany(Like, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
  as: 'likes', // FIX: Add alias for the Like association
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

// User - Follower (Many-to-Many), self-referential)
User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followed_id',
});

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

