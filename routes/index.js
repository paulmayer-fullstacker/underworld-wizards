// routes/indexedDB.js
// Entry point for all API routes in the application. Index acts as a central hub, bringing together and organising all the route files.

// Use Express's Router to create a new 'router' object, to handle routes for the application.
const router = require("express").Router();
// Import the routes
// Each file (e.g., post.js, category.js) contains specific API endpoints for that resource.
const postRoutes = require("./post");
const categoryRoutes = require("./category");
const userRoutes = require("./user");
const commentRoutes = require("./comment-routes");
const likeRoutes = require("./like-routes"); 
const followRoutes = require("./follow-routes");
const feedRoutes = require("./feed");
const searchRoutes = require('./search-routes');

// Test endpoint. GET request to '/api' (response with JSON object), checks the API is running correctly.
router.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Add the imported routes to the 'router'. Each line mounts a route file under a specific URL path.
// Now, all routes defined in `category.js` will be available under the `/api/categories` path.
router.use("/api/categories", categoryRoutes);
router.use("/api/posts", postRoutes);
router.use("/api/users", userRoutes);
router.use("/api/comments", commentRoutes);
router.use("/api/likes", likeRoutes);
router.use("/api/follows", followRoutes); 
router.use("/feed", feedRoutes);
router.use('/api/search', searchRoutes); 
// Export the .router. so it can be used by server files (i.e., `server.js`).
module.exports = router;
