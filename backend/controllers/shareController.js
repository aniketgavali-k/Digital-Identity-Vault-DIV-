const Document = require('../models/Document');
const DocumentShare = require('../models/DocumentShare');
const crypto = require('crypto');

// @desc    Create shareable token
// @route   POST /api/share/create
// @access  Private
exports.createShare = async (req, res) => {
  const { documentId, expiryDays } = req.body;

  try {
    const document = await Document.findOne({
      where: { id: documentId, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    const accessToken = crypto.randomBytes(32).toString('hex');
    let expiresAt = null;
    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    }

    const share = await DocumentShare.create({
      documentId,
      accessToken,
      expiresAt,
    });

    res.status(201).json(share);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Access shared document
// @route   GET /api/share/access/:token
// @access  Public
exports.accessSharedDocument = async (req, res) => {
  try {
    const share = await DocumentShare.findOne({
      where: { accessToken: req.params.token },
      include: [Document],
    });

    if (!share) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Token has expired' });
    }

    res.json(share.Document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
