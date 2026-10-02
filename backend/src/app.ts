import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import shareRoutes from './routes/shareRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/share', shareRoutes);

app.get('/', (req, res) => {
  res.send('Digital Identity Vault API is running');
});

export default app;
