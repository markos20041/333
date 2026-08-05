const { Category, Product } = require('../models');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']],
      include: [
        {
          association: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          association: 'products',
          attributes: ['id', 'title', 'mainImage', 'price', 'discountPrice'],
          limit: 3,
          where: { isActive: true },
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيفات',
    });
  }
};

// Get single category
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [
        {
          association: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          association: 'parentCategory',
          required: false,
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'التصنيف غير موجود',
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيف',
    });
  }
};

// Get featured categories
exports.getFeaturedCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isFeatured: true, isActive: true },
      order: [['order', 'ASC']],
      limit: 8,
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيفات المميزة',
    });
  }
};
