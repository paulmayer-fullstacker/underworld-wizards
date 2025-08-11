// routes/category.js
const router = require("express").Router(); 
const { Category } = require("../models"); 
const { authMiddleware } = require("../utils/auth"); // Import our authentication middleware

// --- Route to get all categories ---
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "category_name"], 
      order: [["category_name", "ASC"]], 
    });
    res.status(200).json(categories); // Send status 200 for success
  } catch (error) {
    console.error("Error fetching categories:", error); // Use console.error for errors
    res.status(500).json({ message: "Failed to retrieve categories.", error: error.message }); // Send error message
  }
});

// --- Route to get a single category by ID ---
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      attributes: ["id", "category_name"], 
    });

    if (!category) {
      return res.status(404).json({ message: "No category found with this ID!" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error retrieving category:", error);
    res.status(500).json({ error: "Error retrieving category", details: error.message });
  }
});

// --- Route to add a new category (Protected) ---
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const existingCategory = await Category.findOne({ where: { category_name: category_name } });
    if (existingCategory) {
      return res.status(409).json({ message: "Category with this name already exists." });
    }

    const category = await Category.create({ category_name });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Error adding category", error: error.message });
  }
});


// --- Route to update a category (Protected) ---
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { category_name } = req.body; // Correct field name

    if (!category_name) {
      return res.status(400).json({ message: "Category name is required for update." });
    }

    const [affectedRows] = await Category.update(
      { category_name: category_name }, 
      { where: { id: req.params.id } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "No category found with this ID or no changes made!" });
    }

    res.status(200).json({ message: "Category updated successfully!" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category", details: error.message });
  }
});

// --- Route to delete a category (Protected) ---
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedRows = await Category.destroy({ where: { id: req.params.id } });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "No category found with this ID!" });
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error deleting category", details: error.message });
  }
});
module.exports = router;
