const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SupportTicket = sequelize.define('SupportTicket', {
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
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  category: {
    type: DataTypes.ENUM('general', 'payment', 'order', 'technical', 'other'),
    defaultValue: 'general',
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  lastReplyBy: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: true,
  },
  lastReplyAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'support_tickets',
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assignedTo'] },
  ],
});

module.exports = SupportTicket;
