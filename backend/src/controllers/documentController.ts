import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import fs from 'fs/promises';
import path from 'path';
import { encryptBuffer, decryptBuffer, computeHash } from '../utils/cryptoUtil';
import { v4 as uuidv4 } from 'uuid';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, documentType } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const hash = computeHash(file.buffer);
    const encryptedBuffer = encryptBuffer(file.buffer);
    
    const fileName = `${req.user!.id}/${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const uploadsDir = path.join(__dirname, '../../uploads');
    const userDir = path.join(uploadsDir, req.user!.id);
    
    await fs.mkdir(userDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, encryptedBuffer);

    const document = await prisma.document.create({
      data: {
        userId: req.user!.id,
        title,
        documentType,
        fileUrl: fileName,
        hash,
      }
    });

    // Send _id as id for frontend compatibility since frontend expects _id
    res.status(201).json({ ...document, _id: document.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    // Map id to _id for frontend compatibility
    res.json(documents.map(d => ({ ...d, _id: d.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });

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
    res.status(500).json({ message: 'Server error downloading document' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const filePath = path.join(__dirname, '../../uploads', document.fileUrl);
    await fs.unlink(filePath).catch((err) => console.log('File not found to delete', err));

    await prisma.document.delete({ where: { id: document.id } });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { verificationStatus: status }
    });

    res.json({ ...document, _id: document.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying document' });
  }
};
