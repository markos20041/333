const sequelize = require('../config/db');

// Import all models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const PaymentRequest = require('./PaymentRequest');
const SupportTicket = require('./SupportTicket');
const SupportTicketReply = require('./SupportTicketReply');

// Define associations

// User - Order (one-to-many)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Transaction (one-to-many)
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - PaymentRequest (one-to-many)
User.hasMany(PaymentRequest, { foreignKey: 'userId', as: 'paymentRequests' });
PaymentRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - SupportTicket (one-to-many)
User.hasMany(SupportTicket, { foreignKey: 'userId', as: 'supportTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - SupportTicketReply (one-to-many)
User.hasMany(SupportTicketReply, { foreignKey: 'userId', as: 'ticketReplies' });
SupportTicketReply.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Processed PaymentRequest (one-to-many)
User.hasMany(PaymentRequest, { foreignKey: 'processedBy', as: 'processedPaymentRequests' });
PaymentRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// User - Assigned SupportTicket (one-to-many)
User.hasMany(SupportTicket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Category - Product (one-to-many)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category self-reference for subcategories
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

// Order - OrderItem (one-to-many)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product - OrderItem (one-to-many)
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// SupportTicket - SupportTicketReply (one-to-many)
SupportTicket.hasMany(SupportTicketReply, { foreignKey: 'ticketId', as: 'replies' });
SupportTicketReply.belongsTo(SupportTicket, { foreignKey: 'ticketId', as: 'ticket' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Transaction,
  PaymentRequest,
  SupportTicket,
  SupportTicketReply,
};
