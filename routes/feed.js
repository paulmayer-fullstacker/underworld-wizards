// routes/feed.js
// Define the API endpoint for a user's personalized feed, based on who they are following (protected).

// Create Express router for feed routes.
const router = require("express").Router();
// Import all models needed to fetch the feed data.
const { User, Post, Follow, Comment } = require("../models");
// `authMiddleware` protected. Only logged-in users can view their feed.
const { authMiddleware } = require("../utils/auth");

// GET personalized feed for the authenticated user (route triggered by GET request to `/feed`).
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get the ID of the authenticated user from the JWT payload
    const currentUserId = req.user.id;
    console.log(`Authenticated user ID: ${currentUserId}`);

    // Get all records in the `Follow` table where the `follower_id` is the current user's ID. Yields list of all the users the current user is stalking.
    const followingRecords = await Follow.findAll({
      where: {
        follower_id: currentUserId,
      },
      // Only attribute required: IDs of users being followed
      attributes: ['followed_id'],
    });

    // Extract the IDs of the users being followed (map the `followingRecords` array to get list of `followed_id`s).
    const followedUserIds = followingRecords.map(record => record.followed_id);
    
    // Add the current user's ID to the list to show their own posts in the feed
    followedUserIds.push(currentUserId);
    console.log(`Fetching posts from user IDs: ${followedUserIds}`);

    // Fetch all posts from the users in the `followedUserIds` array
    const feedPosts = await Post.findAll({
      where: {
        user_id: followedUserIds, // Remember: followedUserIds incs currentUserId
      },
      // Eagerly load (from a single database query) the associated User, Comments, and Likes data
      include: [
        {
          model: User,
          as: 'user', 
          attributes: ['id', 'username']   // Specify which user attributes to inc.
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'CommentAuthor',
              attributes: ['id', 'username']
            }
          ]
        },
        {
          model: User,
          as: 'likers', // Many-to-Many relationship alias
          attributes: ['id', 'username'],
          // `through: { attributes: [] }` prevents the join table data from being returned.
          through: {
            attributes: [],
          },
        },
      ],
      // Order posts so the newest ones appear at top of feed.
      order: [['createdOn', 'DESC']],
    });
    
    res.status(200).json(feedPosts);
  } catch (err) {
    console.error("Error fetching personalized feed:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});
module.exports = router;