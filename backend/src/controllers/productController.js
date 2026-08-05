const { Product, Category, OrderItem } = require('../models');
const { Op } = require('sequelize');

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 12,
      sort = 'createdAt',
    } = req.query;

    const where = { isActive: true };

    // Filter by category
    if (category) {
      const categoryRecord = await Category.findOne({ where: { slug: category } });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    // Featured filter
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Sorting options
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'sales') order = [['salesCount', 'DESC']];
    if (sort === 'views') order = [['views', 'DESC']];

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          association: 'category',
          attributes: ['id', 'nameAr', 'slug'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات',
    });
  }
};

// Get single product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [
        {
          association: 'category',
          attributes: ['id', 'nameAr', 'slug'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    // Increment views
    await product.increment('views');

    // Get related products
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id },
        isActive: true,
      },
      limit: 4,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { product, relatedProducts },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتج',
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isFeatured: true, isActive: true },
      include: [
        {
          association: 'category',
          attributes: ['id', 'nameAr', 'slug'],
        },
      ],
      limit: 8,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات المميزة',
    });
  }
};

// Get best selling products
exports.getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        {
          association: 'category',
          attributes: ['id', 'nameAr', 'slug'],
        },
      ],
      limit: 8,
      order: [['salesCount', 'DESC']],
    });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error('Get best selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الأكثر مبيعاً',
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال كلمة بحث صحيحة',
      });
    }

    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { shortDescription: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: [
        {
          association: 'category',
          attributes: ['id', 'nameAr', 'slug'],
        },
      ],
      limit: 10,
    });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث',
    });
  }
};
