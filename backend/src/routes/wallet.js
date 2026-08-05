const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Wallet routes
router.get('/info', walletController.getWalletInfo);
router.get('/transactions', walletController.getTransactionHistory);
router.post('/deposit', walletController.submitPaymentRequest);
router.get('/deposits', walletController.getPaymentRequests);

module.exports = router;
