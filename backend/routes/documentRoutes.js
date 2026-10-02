const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadDocument, 
  getMyDocuments, 
  getPendingDocuments,
  updateDocumentStatus, 
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer storage in memory to encrypt before saving
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/my-documents', protect, getMyDocuments);
router.get('/pending', protect, authorize('admin', 'verifier'), getPendingDocuments);
router.get('/download/:id', protect, downloadDocument);
router.put('/update/:id', protect, authorize('admin', 'verifier'), updateDocumentStatus);
router.delete('/delete/:id', protect, deleteDocument);

module.exports = router;
