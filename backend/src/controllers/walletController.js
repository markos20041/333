const { User, Transaction, PaymentRequest } = require('../models');

// Get wallet balance and recent transactions
exports.getWalletInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'walletBalance'],
    });

    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({
      success: true,
      data: {
        balance: user.walletBalance,
        transactions,
      },
    });
  } catch (error) {
    console.error('Get wallet info error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب معلومات المحفظة',
    });
  }
};

// Submit payment request for wallet top-up
exports.submitPaymentRequest = async (req, res) => {
  try {
    const { paymentMethod, amount, transactionHash, senderPhone, senderName, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ غير صحيح',
      });
    }

    // Validate payment method specific fields
    if (paymentMethod === 'sham_cash' && !senderPhone) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال رقم الهاتف لـ شام كاش',
      });
    }

    if ((paymentMethod === 'usdt_trc20' || paymentMethod === 'usdt_erc20') && !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال رمز المعاملة (TXID)',
      });
    }

    const paymentRequest = await PaymentRequest.create({
      userId: req.user.id,
      paymentMethod,
      amount,
      transactionHash,
      senderPhone,
      senderName,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب الإيداع بنجاح، سيتم مراجعته من قبل الإدارة',
      data: { paymentRequest },
    });
  } catch (error) {
    console.error('Submit payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال طلب الإيداع',
    });
  }
};

// Get user payment requests
exports.getPaymentRequests = async (req, res) => {
  try {
    const paymentRequests = await PaymentRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({
      success: true,
      data: { paymentRequests },
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب طلبات الدفع',
    });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    
    const where = { userId: req.user.id };
    
    if (type) {
      where.type = type;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        transactions: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
        },
      },
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب سجل المعاملات',
    });
  }
};
