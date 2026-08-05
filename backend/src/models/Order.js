const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('wallet', 'sham_cash', 'usdt_trc20', 'usdt_erc20'),
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deliveredData: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  transactionHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'orders',
  indexes: [
    { fields: ['orderNumber'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] },
  ],
});

module.exports = Order;
