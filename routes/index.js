// // /routes/indexedDB.js

// const router = require("express").Router();

// const postRoutes = require("./post");
// const categoryRoutes = require("./category");
// const userRoutes = require("./user");
// const commentRoutes = require("./comment-routes");
// const likeRoutes = require("./like-routes");
// const followRoutes = require("./follow-routes");
// const feedRoutes = require("./feed"); // Import the feed route

// router.get("/api", (req, res) => {
//   res.json({ message: "Welcome to the API" });
// });

// router.use("/api/categories", categoryRoutes);
// router.use("/api/posts", postRoutes);
// router.use("/api/users", userRoutes);
// router.use("/api/comments", commentRoutes);
// router.use("/api/likes", likeRoutes);
// router.use("/api/follows", followRoutes);
// router.use("/feed", feedRoutes);  // Add the feed route

// module.exports = router;

const router = require("express").Router();

const postRoutes = require("./post");
const categoryRoutes = require("./category");
const userRoutes = require("./user");
const commentRoutes = require("./comment-routes");
const likeRoutes = require("./like-routes");
const followRoutes = require("./follow-routes");
const feedRoutes = require("./feed");  // Import the feed route
const searchRoutes = require('./search-routes'); // Import the search routes

router.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/api/categories", categoryRoutes);
router.use("/api/posts", postRoutes);
router.use("/api/users", userRoutes);
router.use("/api/comments", commentRoutes);
router.use("/api/likes", likeRoutes);
router.use("/api/follows", followRoutes);
router.use("/feed", feedRoutes);  // Add the feed route
router.use('/api/search', searchRoutes); // Add the search routes

module.exports = router;
