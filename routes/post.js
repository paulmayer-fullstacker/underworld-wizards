// routes/post.js
const router = require('express').Router();
const { Post, User, Comment, Category, Like } = require('../models');
const { authMiddleware } = require('../utils/auth');

// GET all posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = req.query.category_id ? { category_id: req.query.category_id } : {};

    const postData = await Post.findAll({
      order: [['createdOn', 'DESC']],
      where,
      include: [
        {
          model: User,
          // FIX: The alias for the post's author must be lowercase 'user' to match the model definition
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

    res.status(200).json(postData);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts.', error: err.message });
  }
});

// GET a single post by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          // FIX: The alias for the post's author must be lowercase 'user'
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

    if (!postData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    res.status(200).json(postData);
  } catch (err) {
    console.error('Error viewing post:', err);
    res.status(500).json({ message: 'Error viewing post.', error: err.message });
  }
});

// POST create a new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newPost = await Post.create({
      title: req.body.title,
      content: req.body.content,
      category_id: req.body.category_id || null,
      user_id: req.user.id,
      postedBy: req.user.username,
    });

    res.status(200).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(400).json({ message: 'Failed to create post.', error: err.message });
  }
});

// PUT update a post by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const postToUpdate = await Post.findByPk(req.params.id);

    if (!postToUpdate) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    if (postToUpdate.user_id !== req.user.id) {
      res.status(403).json({ message: 'You are not authorized to update this post.' });
      return;
    }

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
    const postToDelete = await Post.findByPk(req.params.id);

    if (!postToDelete) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    if (postToDelete.user_id !== req.user.id) {
      res.status(403).json({ message: 'You are not authorized to delete this post.' });
      return;
    }

    await postToDelete.destroy();

    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post.', error: err.message });
  }
});

module.exports = router;

