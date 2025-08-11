// // seeds/seed.js
// // Import required packages
// const sequelize = require("../config/connection");

// // import models
// const { User, Post, Comment, Category } = require("../models"); 

// // import seed data
// const userData = require("./users.json");
// const postData = require("./posts.json");
// const categoryData = require("./categories.json"); 

// // Seed database
// const seedDatabase = async () => {
//   await sequelize.sync({ force: true }); 
//   console.log('\n----- DATABASE SYNCED (FORCED) -----\n');

//   // 1. Seed Users FIRST
//   await User.bulkCreate(userData, {
//     individualHooks: true,
//     returning: true,
//   });
//   console.log('\n----- USERS SEEDED -----\n');

//   // 2. Seed Categories
//    await Category.bulkCreate(categoryData);
//   console.log('\n----- CATEGORIES SEEDED -----\n');

//   // 3. Seed Posts
//   await Post.bulkCreate(postData);
//   console.log('\n----- POSTS SEEDED -----\n');
//   process.exit(0); // Exit the process when seeding is complete
// };
// // Call seedDatabase function to start seeding
// seedDatabase();

// seeds/seed.js
// Import required packages
const sequelize = require("../config/connection");

// import models
const { User, Post, Comment, Category, Like } = require("../models"); 

// import seed data
const userData = require("./users.json");
const postData = require("./posts.json");
const categoryData = require("./categories.json"); 
// NEW: Import the likes seed data
const likeData = require("./likes.json");

// Seed database
const seedDatabase = async () => {
  await sequelize.sync({ force: true }); 
  console.log('\n----- DATABASE SYNCED (FORCED) -----\n');

  // 1. Seed Users FIRST
  await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
  });
  console.log('\n----- USERS SEEDED -----\n');

  // 2. Seed Categories
  await Category.bulkCreate(categoryData);
  console.log('\n----- CATEGORIES SEEDED -----\n');

  // 3. Seed Posts
  await Post.bulkCreate(postData);
  console.log('\n----- POSTS SEEDED -----\n');

  // NEW: Seed the likes table. Must be done after Posts, as Likes depend on Users and Posts
  await Like.bulkCreate(likeData);
  console.log('\n----- LIKES SEEDED -----\n');

  process.exit(0); // Exit the process when seeding is complete
};
// Call seedDatabase function to start seeding
seedDatabase();

