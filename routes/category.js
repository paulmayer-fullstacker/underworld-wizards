// routes/category.js
// Define all API routes for managing categories.

// Create new Express router instance to handle category-related routes.
const router = require("express").Router();
// Import the Category model, allowing us to interact with the categories table in the database.
const { Category } = require("../models");
// Import custom authentication middleware. This function checks user is authenticated, before allowing access to protected certain routes.
const { authMiddleware } = require("../utils/auth");

// Route to get all categories
// GET request to the root of this router (`/`). Using `authMiddleware` to ensure only authenticated users can access the route.
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Use `Category.findAll` method to retrieve all categories from the Db.
    const categories = await Category.findAll({
      // `attributes` specifies which columns to include in the result.
      attributes: ["id", "category_name"],
      // Sort results by `category_name`, ascending. 
      order: [["category_name", "ASC"]], 
    });
    // If successful, return status of 200 (OK), and the list of categories as a JSON array.
    res.status(200).json(categories);
  } catch (error) {
    // If an error occurs, log msg and error to the console for debugging
    console.error("Error fetching categories:", error);
    // Return status 500 (Internal Server Error) and a JSON error message.
    res.status(500).json({ message: "Failed to retrieve categories.", error: error.message }); // Send error message
  }
});

// Route to get a single category by ID. Eg.: `/api/categories/1`.
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // `Category.findByPk` finds a single category by primary key (ID).
    const category = await Category.findByPk(req.params.id, {
      attributes: ["id", "category_name"], 
    });
    // If no category found: return 404 (Not Found) status.
    if (!category) {
      return res.status(404).json({ message: "No category found with this ID!" });
    }
    // Else, return the found category with a 200 (OK) status.
    res.status(200).json(category);
  } catch (error) {
    console.error("Error retrieving category:", error);
    res.status(500).json({ error: "Error retrieving category", details: error.message });
  }
});

// Route to add a new category (Protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
     // Extract `category_name` from the request body.
    const { category_name } = req.body;
    // If `category_name` is not present, return 400 (Bad Request).
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    // If a category with the same name already exists, prevent duplicates.
    const existingCategory = await Category.findOne({ where: { category_name: category_name } });
    if (existingCategory) {
      // If existing: send 409 (Conflict) status.
      return res.status(409).json({ message: "Category with this name already exists." });
    }
    // Else: create new category in Db.
    const category = await Category.create({ category_name });
    // Return newly created category with a 201 (Created) status.
    res.status(201).json(category);
  } catch (error) {
    // Catch all unanticipated errors
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Error adding category", error: error.message });
  }
});


// Route to update a category (Protected)
// PUT request to specific category ID. Eg.: `/api/categories/1`.
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Extract `category_name` from the request body.
    const { category_name } = req.body; 
    // If `category_name` is not present, return 400 (Bad Request).
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required for update." });
    }

    const [affectedRows] = await Category.update(
      { category_name: category_name },
      // The `where` clause ensures only category with the matching ID is updated. 
      { where: { id: req.params.id } }
    );
    // If `affectedRows` is 0, no category was found with that ID, or no changes were made.
    if (affectedRows === 0) {
      return res.status(404).json({ message: "No category found with this ID or no changes made!" });
    }
    // If update successful, return 200 (OK) status and success message.
    res.status(200).json({ message: "Category updated successfully!" });
  } catch (error) {
    // Catch all unanticipated errors
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category", details: error.message });
  }
});

// Route to delete a category (Protected)
// DELETE request to a specific category ID.
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // `Category.destroy` deletes the category from Db.
    const deletedRows = await Category.destroy({ where: { id: req.params.id } });
    // If `deletedRows` 0, no category found to delete.
    if (deletedRows === 0) {
      return res.status(404).json({ message: "No category found with this ID!" });
    }
    // On success, return 200 (OK) status and success message.
    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
     // Catch all unanticipated errors
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error deleting category", details: error.message });
  }
});
// Export router for use in `routes/index.js`
module.exports = router;
