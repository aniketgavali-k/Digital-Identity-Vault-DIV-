const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Document = require('./Document');

const DocumentShare = sequelize.define('DocumentShare', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

Document.hasMany(DocumentShare, { foreignKey: 'documentId', onDelete: 'CASCADE' });
DocumentShare.belongsTo(Document, { foreignKey: 'documentId' });

module.exports = DocumentShare;
