// routes/post.js
// Handle API routes related to posts, inc.: getting all posts, a single post, creating, updating, or deleting posts.

const router = require('express').Router();
const { Post, User, Comment, Category, Like } = require('../models');
const { authMiddleware } = require('../utils/auth');

// GET all posts
// Eendpoint: `/api/posts`, fetches all posts from the database. Can also be filtered by category.
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if `category_id` query parameter exists in the URL (e.g., `/api/posts?category_id=1`).
    // If it exists, it creates a `where` object to filter the results. Otherwise, the object is empty and no filtering occurs.
    const where = req.query.category_id ? { category_id: req.query.category_id } : {};

    // We use `Post.findAll` to retrieve all posts
    const postData = await Post.findAll({
      // `order` sorts the posts by creation date in descending order, showing the newest first.
      order: [['createdOn', 'DESC']],
      // The `where` object is used to apply the optional category filter.
      where,
      // `include` used for 'eager loading'. Fetching related data from other models in a single query. More efficient than making multiple queries.
      include: [
        {
          // Include `User` model, aliased as 'user', to get information about the post's author.
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
        {
          // Include `Comment` model to get all comments for each post.
          model: Comment,
          as: 'comments',
          attributes: ['id', 'comment_text', 'createdAt'],
          include: {
            // Within `Comment` model, include `User` model, aliased as 'CommentAuthor', to get the comment's author.
            model: User,
            as: 'CommentAuthor',
            attributes: ['id', 'username'],
          },
        },
        {
          // Include `Category` model to get the post's category.
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name'],
        },
        {
          // Include `User` model, aliased as 'likers', to get a list of all users who liked the post. !Alias prevents User/User? confusion
          model: User,
          as: 'likers',
          attributes: ['id', 'username'],
          through: {
            attributes: [],
          },
        },
      ],
    });
    // If success, return 200 OK status with the fetched post data.
    res.status(200).json(postData);
    // Else: catch error
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts.', error: err.message });
  }
});

// GET a single post by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // `Post.findByPk` finds a single post by its primary key (ID).
    const postData = await Post.findByPk(req.params.id, {
      // Use same eager-loading structure as the `GET all posts` route to provide a complete view of the post.
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'comment_text', 'createdAt'],
          include: {
            model: User,
            as: 'CommentAuthor',
            attributes: ['id', 'username'],
          },
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name'],
        },
        {
          model: User,
          as: 'likers',
          attributes: ['id', 'username'],
          through: {
            attributes: [],
          },
        },
      ],
    });
    // If: no post found, return a 404 Not Found status and msg.
    if (!postData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }
    // Else: return the single post with a 200 OK status.
    res.status(200).json(postData);
    // Catch all other errors
  } catch (err) {
    console.error('Error viewing post:', err);
    res.status(500).json({ message: 'Error viewing post.', error: err.message });
  }
});

// POST create a new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    // `Post.create` inserts a new post into the database using data from the request body and the authenticated user's ID.
    const newPost = await Post.create({
      title: req.body.title,
      content: req.body.content,
      category_id: req.body.category_id || null,  // Allows the category to be optional.
      user_id: req.user.id,                       // Get user ID from the `authMiddleware`.
      postedBy: req.user.username,
    });
    // Return newly created post with a 200 OK status.
    res.status(200).json(newPost);
    // Catch error
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(400).json({ message: 'Failed to create post.', error: err.message });
  }
});

// PUT update a post by ID
router.put('/:id', authMiddleware, async (req, res) => {
  // Find the post to ensure it exists.
  try {
    const postToUpdate = await Post.findByPk(req.params.id);

    if (!postToUpdate) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }
    // If: post's `user_id` does not matche the authenticated user's ID.
    if (postToUpdate.user_id !== req.user.id) {
      // Return a 403 Forbidden status, preventing an unauthorized user from updating the post.
      res.status(403).json({ message: 'You are not authorized to update this post.' });
      return;
    }
    // Else: User is authorized. Update the post with the new data from the request body.
    const updatedPost = await postToUpdate.update({
      title: req.body.title,
      content: req.body.content,
      category_id: req.body.category_id || null,
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(400).json({ message: 'Failed to update post.', error: err.message });
  }
});

// DELETE a post by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Find post to be deleted.
    const postToDelete = await Post.findByPk(req.params.id);
    // If: no post to delete
    if (!postToDelete) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }
    // If: authenticated user is NOT the owner of the post
    if (postToDelete.user_id !== req.user.id) {
      // Return a 403 Forbidden status and msg.
      res.status(403).json({ message: 'You are not authorized to delete this post.' });
      return;
    }
    // Else: user is authorized and post to delete:, delete post from Db.
    await postToDelete.destroy();

    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post.', error: err.message });
  }
});
// Export rout to index.js
module.exports = router;

