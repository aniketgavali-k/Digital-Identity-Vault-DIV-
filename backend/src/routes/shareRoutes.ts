import express from 'express';
import { createShareLink, accessSharedDocument } from '../controllers/shareController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/create').post(protect, createShareLink);
router.route('/access/:token').get(accessSharedDocument);

export default router;
