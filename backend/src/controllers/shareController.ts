import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { decryptBuffer } from '../utils/cryptoUtil';

export const createShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, expiresInHours } = req.body;

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: req.user!.id }
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const token = crypto.randomBytes(20).toString('hex');
    let expiresAt;
    
    if (expiresInHours) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresInHours));
    }

    const shareToken = await prisma.shareToken.create({
      data: {
        documentId,
        token,
        createdBy: req.user!.id,
        expiresAt,
      }
    });

    res.status(201).json({ token: shareToken.token, expiresAt: shareToken.expiresAt });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating share link' });
  }
};

export const accessSharedDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: { document: true }
    });

    if (!shareToken) return res.status(404).json({ message: 'Invalid or expired token' });
    
    // Check expiration manually since sqlite doesn't have auto expire indexes
    if (shareToken.expiresAt && new Date() > shareToken.expiresAt) {
      await prisma.shareToken.delete({ where: { id: shareToken.id } });
      return res.status(404).json({ message: 'Token has expired' });
    }

    const document = shareToken.document;

    const filePath = path.join(__dirname, '../../uploads', document.fileUrl);
    const buffer = await fs.readFile(filePath);
    const decryptedBuffer = decryptBuffer(buffer);

    let mimeType = 'application/octet-stream';
    if (document.fileUrl.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (document.fileUrl.match(/\.(jpg|jpeg|png)$/i)) mimeType = 'image/jpeg';

    res.set('Content-Type', mimeType);
    res.send(decryptedBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error accessing shared document' });
  }
};
