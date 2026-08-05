const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SupportTicketReply = sequelize.define('SupportTicketReply', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'support_tickets',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  timestamps: true,
  tableName: 'support_ticket_replies',
  indexes: [
    { fields: ['ticketId'] },
    { fields: ['userId'] },
  ],
});

module.exports = SupportTicketReply;
