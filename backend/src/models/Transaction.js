const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  referenceType: {
    type: DataTypes.ENUM('order', 'deposit', 'withdrawal', 'refund', 'adjustment'),
    allowNull: true,
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.ENUM('wallet', 'sham_cash', 'usdt_trc20', 'usdt_erc20', 'admin'),
    allowNull: true,
  },
  transactionHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  timestamps: true,
  tableName: 'transactions',
  indexes: [
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['referenceType'] },
  ],
});

module.exports = Transaction;
