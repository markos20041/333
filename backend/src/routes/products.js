const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/featured', categoryController.getFeaturedCategories);
router.get('/categories/:slug', categoryController.getCategoryBySlug);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/bestselling', productController.getBestSellingProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:slug', productController.getProductBySlug);

module.exports = router;
