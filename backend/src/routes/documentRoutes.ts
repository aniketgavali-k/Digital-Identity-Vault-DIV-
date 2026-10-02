import express from 'express';
import { uploadDocument, getMyDocuments, downloadDocument, deleteDocument, verifyDocument } from '../controllers/documentController';
import { protect, verifierOrAdmin } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.route('/upload').post(protect, upload.single('file'), uploadDocument);
router.route('/my-documents').get(protect, getMyDocuments);
router.route('/download/:id').get(protect, downloadDocument);
router.route('/delete/:id').delete(protect, deleteDocument);

// Verifier endpoints
router.route('/verify/:id').put(protect, verifierOrAdmin, verifyDocument);

export default router;
