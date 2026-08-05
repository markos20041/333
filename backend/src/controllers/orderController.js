const { Order, OrderItem, Product, User, Transaction } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create new order
exports.createOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();
  
  try {
    const { items, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'السلة فارغة',
      });
    }

    // Calculate total and validate products
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `المنتج غير موجود`,
        });
      }

      if (!product.isActive) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `المنتج ${product.title} غير متوفر حالياً`,
        });
      }

      if (!product.isUnlimited && product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `الكمية المطلوبة غير متوفرة للمنتج ${product.title}`,
        });
      }

      const unitPrice = product.discountPrice || product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: product.id,
        productName: product.title,
        productImage: product.mainImage,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });

      // Update stock if not unlimited
      if (!product.isUnlimited) {
        await product.decrement('stock', { by: item.quantity });
      }

      // Increment sales count
      await product.increment('salesCount', { by: item.quantity });
    }

    // Check wallet balance if paying with wallet
    if (paymentMethod === 'wallet') {
      const user = await User.findByPk(userId);
      
      if (user.walletBalance < subtotal) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'الرصيد في المحفظة غير كافٍ',
        });
      }

      // Deduct from wallet
      const balanceBefore = parseFloat(user.walletBalance);
      await user.update({ walletBalance: balanceBefore - subtotal });

      // Create transaction record
      await Transaction.create({
        userId,
        type: 'debit',
        amount: subtotal,
        balanceBefore,
        balanceAfter: balanceBefore - subtotal,
        description: 'شراء طلب #' + generateOrderNumber(),
        referenceType: 'order',
        paymentMethod: 'wallet',
        status: 'completed',
      }, { transaction });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId,
      status: paymentMethod === 'wallet' ? 'processing' : 'pending',
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
      paymentMethod,
      subtotal,
      total: subtotal,
      notes,
    }, { transaction });

    // Create order items
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...itemData,
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: { order },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الطلب',
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const where = { userId: req.user.id };
    
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          association: 'orderItems',
          include: [
            {
              association: 'product',
              attributes: ['id', 'title', 'mainImage'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
        },
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلبات',
    });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          association: 'orderItems',
          include: [
            {
              association: 'product',
              attributes: ['id', 'title', 'mainImage', 'description'],
            },
          ],
        },
        {
          association: 'user',
          attributes: ['id', 'username', 'email', 'phone'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلب',
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();
  
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء الطلب في حالته الحالية',
      });
    }

    // Restore stock
    const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
    
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId);
      if (product && !product.isUnlimited) {
        await product.increment('stock', { by: item.quantity });
      }
    }

    // Refund wallet if paid
    if (order.paymentMethod === 'wallet' && order.paymentStatus === 'paid') {
      const user = await User.findByPk(order.userId);
      const balanceBefore = parseFloat(user.walletBalance);
      
      await user.update({ walletBalance: balanceBefore + parseFloat(order.total) });

      await Transaction.create({
        userId: order.userId,
        type: 'credit',
        amount: order.total,
        balanceBefore,
        balanceAfter: balanceBefore + parseFloat(order.total),
        description: `استرداد أموال للطلب ${order.orderNumber}`,
        referenceType: 'refund',
        referenceId: order.id,
        paymentMethod: 'wallet',
        status: 'completed',
      }, { transaction });
    }

    await order.update({ status: 'cancelled' }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إلغاء الطلب',
    });
  }
};
