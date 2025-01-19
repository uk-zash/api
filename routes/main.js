const express = require('express');
const router = express.Router();
const Product  = require('../models/product');
const { Category } = require('../models/category');
const { User } = require('../models/user');

// Route to get home page with products, categories and user info
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();  // Fetch categories
        const products = await Product.find().populate('category'); // Fetch products
        
        // User role (can be obtained from JWT token or session)
        const user = req.user; // Assuming this is set by your auth middleware

        // Featured products
        const featuredProducts = await Product.find({ isFeatured: true }).populate('category');

        res.render('index', {
            categories,
            products,
            user,
            featuredProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching products or categories.");
    }
});

module.exports = router;
