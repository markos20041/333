const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentRequest = sequelize.define('PaymentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  paymentMethod: {
    type: DataTypes.ENUM('sham_cash', 'usdt_trc20', 'usdt_erc20'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  transactionHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  senderPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  proofImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'payment_requests',
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['paymentMethod'] },
  ],
});

module.exports = PaymentRequest;
