// seeds/likes.js
const { Like } = require("../models");

const likeData = [
  {
    // SeededUser1 likes "The Rise of AI in Web Development"
    user_id: 1,
    post_id: 1,
  },
  {
    // SeededUser1 likes "Understanding JavaScript Closures"
    user_id: 1,
    post_id: 2,
  },
  {
    // SeededUser1 likes "Node.js Performance Optimization Tips"
    user_id: 1,
    post_id: 3,
  },
  {
    // SeededUser1 likes "Mastering Sequelize for Database Management"
    user_id: 1,
    post_id: 4,
  },
  {
    // SeededUser2 likes "Async/Await in JavaScript Explained"
    user_id: 2,
    post_id: 5,
  },
  {
    // SeededUser2 likes "Introduction to GraphQL"
    user_id: 2,
    post_id: 6,
  },
];

const seedLikes = () => Like.bulkCreate(likeData);

module.exports = seedLikes;
