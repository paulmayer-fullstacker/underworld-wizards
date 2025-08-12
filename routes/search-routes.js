// // routes/search-routes.js
// Define API endpoint for searching posts based on a query.

// Creating new Express router for search functionality.
const router = require('express').Router();
// We the `Op` (Operators) object from Sequelize, which allows us to use logical operators like `OR` and `LIKE` in queries.
const { Op } = require('sequelize');
// Import all the models needed to perform the search and eagerly load related data.
const { Post, User, Comment, Category, Like } = require('../models');
// Protect search-routes with `authMiddleware` to ensure only logged-in users can search.
const { authMiddleware } = require('../utils/auth');

// GET search results for posts (protected). Expects a query parameter 'q' (Example: /api/search?q=javascript).
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get the search term from the query parameter.
    const searchTerm = req.query.q;
    // If: no search term provided in the query.
    if (!searchTerm) {
      // Return a 400 Bad Request status.
      return res.status(400).json({ message: 'A search term is required.' });
    }
    // Else: Perform a case-insensitive search for posts where the title or content contains the search term.
    const searchResults = await Post.findAll({
      where: {
        // Use `Op.or` to search for the term in either the `title` or the `content` of the post.
        [Op.or]: [
          {
            title: {
              // `Op.like` performs a pattern match. The `%` wildcards mean the search term can appear anywhere in the string.
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
          as: 'user',
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
            as: 'CommentAuthor', 
            attributes: ['id', 'username'],
          },
        },
        {
          model: User,
          as: 'likers', 
          attributes: ['id', 'username'],
          // The 'through' option used to prevent the join table data from being returned
          through: {
            attributes: []
          }
        },
      ],
      // Sort results by creation date in descending order.
      order: [['createdOn', 'DESC']],
    });

    res.status(200).json(searchResults);
  } catch (err) {
    console.error('Error during post search:', err);
    res.status(500).json({ message: 'Failed to retrieve search results.', error: err.message });
  }
});
// Export, making available to index.js
module.exports = router;

