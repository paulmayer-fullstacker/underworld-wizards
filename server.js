// Import required packages
const express = require("express");
const path = require("path"); 
const sequelize = require("./config/connection");
const routes = require("./routes");

// Initialize Express application
const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

const rebuild = process.argv[2] === "--rebuild";

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm"));
});

// GET requests for single post pages
app.get("/post/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "single-post.htm"));
});

// Add routes (main router)
app.use(routes);

// Sync database and start server
sequelize.sync({ force: rebuild }).then(() => {
  app.listen(PORT, () => console.log(`App listening on port ${PORT}!`)); // Added specific port info
}).catch(err => console.error('Sequelize sync error:', err)); // Added error logging for sync

// Force reseed DB. Sync database and start server. NOTE: Comment out Sync database and start server
// sequelize.sync({ force: true }).then(() => { 
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
// }).catch(err => console.error('Sequelize sync error:', err));
