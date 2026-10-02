const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { encrypt, computeHash } = require('../utils/security');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { documentType } = req.body;

  try {
    const fileBuffer = req.file.buffer;
    const encryptedBuffer = encrypt(fileBuffer);
    const fileHash = computeHash(fileBuffer);

    // For simplicity in this demo, we save to a local "uploads" folder
    // In production, this would go to S3
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const fileName = `${Date.now()}-${req.file.originalname}.enc`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, encryptedBuffer);

    // AI Auto-Verification Logic
    let verificationStatus = 'pending';
    let notificationMessage = `Your document '${documentType}' has been uploaded and is pending verification.`;

    try {
      console.log(`Starting OCR for user: ${req.user.name}`);
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
      const extractedText = text.toLowerCase();
      const userName = req.user.name.toLowerCase();

      // Check if full name is present in extracted text
      if (extractedText.includes(userName)) {
        verificationStatus = 'verified';
        notificationMessage = `Your document '${documentType}' has been automatically verified!`;
        console.log(`Auto-verification SUCCESS for ${req.user.name}`);
      } else {
        console.log(`Auto-verification FAILED: Name not found in OCR text.`);
      }
    } catch (ocrError) {
      console.error('OCR Auto-verification Error:', ocrError);
      // Fallback to pending
    }

    const document = await Document.create({
      userId: req.user.id,
      documentType,
      fileUrl: fileName, 
      fileHash,
      verificationStatus,
    });

    // Notify user
    await Notification.create({
      userId: req.user.id,
      message: notificationMessage,
    });

    res.status(201).json({
      ...document.toJSON(),
      autoVerified: verificationStatus === 'verified'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all documents for logged in user
// @route   GET /api/documents/my-documents
// @access  Private
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({ where: { userId: req.user.id } });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending documents for verification
// @route   GET /api/documents/pending
// @access  Private (Verifier/Admin)
exports.getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({ 
      where: { verificationStatus: 'pending' },
      include: [{ model: User, attributes: ['name', 'email'] }] 
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update document status (Verifier only)
// @route   PUT /api/documents/update/:id
// @access  Private (Verifier/Admin)
exports.updateDocumentStatus = async (req, res) => {
  const { verificationStatus } = req.body;

  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.verificationStatus = verificationStatus;
    await document.save();

    // Notify user
    await Notification.create({
      userId: document.userId,
      message: `Your document '${document.documentType}' has been ${verificationStatus}.`,
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/delete/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete local file
    const filePath = path.join(__dirname, '../uploads', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download and decrypt document
// @route   GET /api/documents/download/:id
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '../uploads', document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const encryptedBuffer = fs.readFileSync(filePath);
    const { decrypt } = require('../utils/security');
    const decryptedBuffer = decrypt(encryptedBuffer);

    // Set headers for download
    // We try to guess the original filename or use a generic one
    const originalName = document.fileUrl.split('-').slice(1).join('-').replace('.enc', '');
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.send(decryptedBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
