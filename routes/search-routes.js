// // routes/search-routes.js
// const router = require('express').Router();
// const { Op } = require('sequelize');
// const { Post, User, Comment, Category, Like } = require('../models');
// const { authMiddleware } = require('../utils/auth');

// // GET search results for posts
// // This route is protected by authentication and expects a query parameter 'q'.
// // Example: /api/search?q=javascript
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const searchTerm = req.query.q;

//     // Check if a search term was provided in the query.
//     if (!searchTerm) {
//       return res.status(400).json({ message: 'A search term is required.' });
//     }

//     // Perform a case-insensitive search for posts where the title or content
//     // contains the search term. The Op.iLike operator is for case-insensitive
//     // pattern matching in PostgreSQL, but Op.like with a lowercase conversion
//     // is a common way to achieve this across other databases.
//     const searchResults = await Post.findAll({
//       where: {
//         [Op.or]: [
//           {
//             title: {
//               [Op.like]: `%${searchTerm}%`,
//             },
//           },
//           {
//             content: {
//               [Op.like]: `%${searchTerm}%`,
//             },
//           },
//         ],
//       },
//       // Eagerly load all related data to provide a comprehensive response
//       include: [
//         {
//           model: User,
//           attributes: ['id', 'username'],
//         },
//         {
//           model: Category,
//           attributes: ['id', 'category_name'],
//         },
//         {
//           model: Comment,
//           include: {
//             model: User,
//             attributes: ['id', 'username'],
//           },
//         },
//         {
//           model: Like,
//           include: {
//             model: User,
//             attributes: ['id', 'username'],
//           },
//         },
//       ],
//       order: [['createdAt', 'DESC']], // Sort results by creation date
//     });

//     res.status(200).json(searchResults);
//   } catch (err) {
//     console.error('Error during post search:', err);
//     res.status(500).json({ message: 'Failed to retrieve search results.', error: err.message });
//   }
// });

// module.exports = router;

const router = require('express').Router();
const { Op } = require('sequelize');
const { Post, User, Comment, Category, Like } = require('../models');
const { authMiddleware } = require('../utils/auth');

// GET search results for posts
// This route is protected by authentication and expects a query parameter 'q'.
// Example: /api/search?q=javascript
router.get('/', authMiddleware, async (req, res) => {
  try {
    const searchTerm = req.query.q;

    // Check if a search term was provided in the query.
    if (!searchTerm) {
      return res.status(400).json({ message: 'A search term is required.' });
    }

    // Perform a case-insensitive search for posts where the title or content
    // contains the search term.
    const searchResults = await Post.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchTerm}%`,
            },
          },
          {
            content: {
              [Op.like]: `%${searchTerm}%`,
            },
          },
        ],
      },
      // Eagerly load all related data to provide a comprehensive response
      include: [
        {
          model: User,
          as: 'user', // FIX: Add the 'user' alias for the post's author
          attributes: ['id', 'username'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name'],
        },
        {
          model: Comment,
          as: 'comments', // Alias the comment model
          include: {
            model: User,
            as: 'CommentAuthor', // FIX: Add the 'CommentAuthor' alias for the comment's author
            attributes: ['id', 'username'],
          },
        },
        {
          model: User,
          as: 'likers', // FIX: Include the 'likers' alias directly for a more efficient query
          attributes: ['id', 'username'],
          // The 'through' option here is used to prevent the join table data from being returned
          through: {
            attributes: []
          }
        },
      ],
      order: [['createdOn', 'DESC']], // Sort results by creation date
    });

    res.status(200).json(searchResults);
  } catch (err) {
    console.error('Error during post search:', err);
    res.status(500).json({ message: 'Failed to retrieve search results.', error: err.message });
  }
});

module.exports = router;

