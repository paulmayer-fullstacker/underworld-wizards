// // routes/feed.js
// const router = require("express").Router();
// const { User, Post, Follow, Comment, Like } = require("../models");
// const { authMiddleware } = require("../utils/auth");

// // GET personalized feed for the authenticated user. Protected by authMiddleware to ensure only logged-in users can access it.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     // Get the ID of the authenticated user from the JWT payload
//     const currentUserId = req.user.id;

//     // Find all users that the current user is following. The `Follow` model links a `follower_id` to a `followed_id`.
//     const followingRecords = await Follow.findAll({
//       where: {
//         follower_id: currentUserId,
//       },
//       attributes: ['followed_id'], // We only need the IDs of the followed users
//     });

//     // Extract the IDs of the users being followed
//     const followedUserIds = followingRecords.map(record => record.followed_id);
    
//     // Add the current user's ID to the list to show their own posts in the feed
//     followedUserIds.push(currentUserId);

//     // Fetch all posts from the users in the `followedUserIds` array
//     const feedPosts = await Post.findAll({
//       where: {
//         user_id: followedUserIds, // Find posts where the user_id is in our list
//       },
//       // Eagerly load the associated User, Comments, and Likes data
//       include: [
//         {
//           model: User,
//           as: 'user', // Clarify that this is the post's user
//           attributes: ['id', 'username'] // Only include necessary user data
//         },
//         {
//           model: Comment,
//           include: [
//             {
//               model: User,
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           model: Like
//         }
//       ],
//       order: [['createdAt', 'DESC']], // Sort posts by newest first
//     });
    
//     res.status(200).json(feedPosts);
//   } catch (err) {
//     console.error("Error fetching personalized feed:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// module.exports = router;

// // routes/feed.js
// const router = require("express").Router();
// const { User, Post, Follow, Comment, Like } = require("../models");
// const { authMiddleware } = require("../utils/auth");

// // GET personalized feed for the authenticated user
// // This route is protected by authMiddleware to ensure only logged-in users can access it.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     // 1. Get the ID of the authenticated user from the JWT payload
//     const currentUserId = req.user.id;

//     // 2. Find all users that the current user is following
//     // The `Follow` model links a `follower_id` to a `followed_id`.
//     const followingRecords = await Follow.findAll({
//       where: {
//         follower_id: currentUserId,
//       },
//       attributes: ['followed_id'], // We only need the IDs of the followed users
//     });

//     // 3. Extract the IDs of the users being followed
//     const followedUserIds = followingRecords.map(record => record.followed_id);
    
//     // Add the current user's ID to the list to show their own posts in the feed
//     followedUserIds.push(currentUserId);

//     // 4. Fetch all posts from the users in the `followedUserIds` array
//     const feedPosts = await Post.findAll({
//       where: {
//         user_id: followedUserIds, // Find posts where the user_id is in our list
//       },
//       // Eagerly load the associated User, Comments, and Likes data
//       include: [
//         {
//           model: User,
//           as: 'user', // Clarify that this is the post's user
//           attributes: ['id', 'username'] // Only include necessary user data
//         },
//         {
//           model: Comment,
//           as: 'comments', // FIX: Add the 'as' alias for the Comment model
//           include: [
//             {
//               model: User,
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           model: Like
//         }
//       ],
//       order: [['createdAt', 'DESC']], // Sort posts by newest first
//     });
    
//     res.status(200).json(feedPosts);
//   } catch (err) {
//     console.error("Error fetching personalized feed:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// module.exports = router;

// // routes/feed.js
// const router = require("express").Router();
// const { User, Post, Follow, Comment, Like } = require("../models");
// const { authMiddleware } = require("../utils/auth");

// // GET personalized feed for the authenticated user
// // This route is protected by authMiddleware to ensure only logged-in users can access it.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     // 1. Get the ID of the authenticated user from the JWT payload
//     const currentUserId = req.user.id;

//     // 2. Find all users that the current user is following
//     // The `Follow` model links a `follower_id` to a `followed_id`.
//     const followingRecords = await Follow.findAll({
//       where: {
//         follower_id: currentUserId,
//       },
//       attributes: ['followed_id'], // We only need the IDs of the followed users
//     });

//     // 3. Extract the IDs of the users being followed
//     const followedUserIds = followingRecords.map(record => record.followed_id);
    
//     // Add the current user's ID to the list to show their own posts in the feed
//     followedUserIds.push(currentUserId);

//     // 4. Fetch all posts from the users in the `followedUserIds` array
//     const feedPosts = await Post.findAll({
//       where: {
//         user_id: followedUserIds, // Find posts where the user_id is in our list
//       },
//       // Eagerly load the associated User, Comments, and Likes data
//       include: [
//         {
//           model: User,
//           as: 'user', // This is the post's author, aliased in models/index.js
//           attributes: ['id', 'username']
//         },
//         {
//           model: Comment,
//           as: 'comments', // This is the post's comments, aliased in models/index.js
//           include: [
//             {
//               model: User,
//               as: 'CommentAuthor', // FIX: Use the correct alias for the comment's author
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           model: Like
//         }
//       ],
//       order: [['createdAt', 'DESC']], // Sort posts by newest first
//     });
    
//     res.status(200).json(feedPosts);
//   } catch (err) {
//     console.error("Error fetching personalized feed:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// module.exports = router;

// // routes/feed.js
// const router = require("express").Router();
// const { User, Post, Follow, Comment, Like } = require("../models");
// const { authMiddleware } = require("../utils/auth");

// // GET personalized feed for the authenticated user
// // This route is protected by authMiddleware to ensure only logged-in users can access it.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     // 1. Get the ID of the authenticated user from the JWT payload
//     const currentUserId = req.user.id;

//     // 2. Find all users that the current user is following
//     // The `Follow` model links a `follower_id` to a `followed_id`.
//     const followingRecords = await Follow.findAll({
//       where: {
//         follower_id: currentUserId,
//       },
//       attributes: ['followed_id'], // We only need the IDs of the followed users
//     });

//     // 3. Extract the IDs of the users being followed
//     const followedUserIds = followingRecords.map(record => record.followed_id);
    
//     // Add the current user's ID to the list to show their own posts in the feed
//     followedUserIds.push(currentUserId);

//     // 4. Fetch all posts from the users in the `followedUserIds` array
//     const feedPosts = await Post.findAll({
//       where: {
//         user_id: followedUserIds, // Find posts where the user_id is in our list
//       },
//       // Eagerly load the associated User, Comments, and Likes data
//       include: [
//         {
//           model: User,
//           as: 'user', // This is the post's author, aliased in models/index.js
//           attributes: ['id', 'username']
//         },
//         {
//           model: Comment,
//           as: 'comments', // This is the post's comments, aliased in models/index.js
//           include: [
//             {
//               model: User,
//               as: 'CommentAuthor', // Use the correct alias for the comment's author
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           model: Like,
//           as: 'likes' // Alias for the Like model
//         }
//       ],
//       order: [['createdOn', 'DESC']], // Sort posts by newest first
//     });
    
//     res.status(200).json(feedPosts);
//   } catch (err) {
//     console.error("Error fetching personalized feed:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// module.exports = router;

// // routes/feed.js
// const router = require("express").Router();
// // We only need Post, User, Follow, and Comment. Like is implicitly handled by the Post-User association.
// const { User, Post, Follow, Comment } = require("../models");
// const { authMiddleware } = require("../utils/auth");

// // GET personalized feed for the authenticated user
// // This route is protected by authMiddleware to ensure only logged-in users can access it.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     // 1. Get the ID of the authenticated user from the JWT payload
//     const currentUserId = req.user.id;

//     // 2. Find all users that the current user is following
//     const followingRecords = await Follow.findAll({
//       where: {
//         follower_id: currentUserId,
//       },
//       attributes: ['followed_id'], // We only need the IDs of the followed users
//     });

//     // 3. Extract the IDs of the users being followed
//     const followedUserIds = followingRecords.map(record => record.followed_id);
    
//     // Add the current user's ID to the list to show their own posts in the feed
//     followedUserIds.push(currentUserId);

//     // 4. Fetch all posts from the users in the `followedUserIds` array
//     const feedPosts = await Post.findAll({
//       where: {
//         user_id: followedUserIds, // Find posts where the user_id is in our list
//       },
//       // Eagerly load the associated User, Comments, and Likes data
//       include: [
//         {
//           // The Post author association is aliased as 'User' (uppercase) in models/index.js
//           model: User,
//           as: 'user', 
//           attributes: ['id', 'username']
//         },
//         {
//           model: Comment,
//           as: 'comments', // This is the post's comments, aliased in models/index.js
//           include: [
//             {
//               model: User,
//               as: 'CommentAuthor', // Use the correct alias for the comment's author
//               attributes: ['id', 'username']
//             }
//           ]
//         },
//         {
//           // The Post likers association is aliased as 'likers' in models/index.js
//           // We need to include the User model with this specific alias.
//           model: User,
//           as: 'likers',
//           attributes: ['id', 'username'],
//           through: {
//             attributes: [], // Exclude the through table attributes from the output
//           },
//         },
//       ],
//       order: [['createdOn', 'DESC']], // Sort posts by newest first
//     });
    
//     res.status(200).json(feedPosts);
//   } catch (err) {
//     console.error("Error fetching personalized feed:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// module.exports = router;

// routes/feed.js
const router = require("express").Router();
const { User, Post, Follow, Comment } = require("../models");
const { authMiddleware } = require("../utils/auth");

// GET personalized feed for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    // 1. Get the ID of the authenticated user from the JWT payload
    const currentUserId = req.user.id;
    console.log(`Authenticated user ID: ${currentUserId}`);

    // 2. Find all users that the current user is following
    const followingRecords = await Follow.findAll({
      where: {
        follower_id: currentUserId,
      },
      attributes: ['followed_id'],
    });

    // 3. Extract the IDs of the users being followed
    const followedUserIds = followingRecords.map(record => record.followed_id);
    
    // Add the current user's ID to the list to show their own posts in the feed
    followedUserIds.push(currentUserId);
    console.log(`Fetching posts from user IDs: ${followedUserIds}`);

    // 4. Fetch all posts from the users in the `followedUserIds` array
    const feedPosts = await Post.findAll({
      where: {
        user_id: followedUserIds,
      },
      // Eagerly load the associated User, Comments, and Likes data
      include: [
        {
          model: User,
          // FIX: The alias for the post's author must be lowercase 'user'
          as: 'user', 
          attributes: ['id', 'username']
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
          as: 'likers',
          attributes: ['id', 'username'],
          through: {
            attributes: [],
          },
        },
      ],
      order: [['createdOn', 'DESC']],
    });
    
    res.status(200).json(feedPosts);
  } catch (err) {
    console.error("Error fetching personalized feed:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});
module.exports = router;





