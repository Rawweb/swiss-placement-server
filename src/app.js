import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';

const app = express();

app.use(cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);

// This is a simple health check endpoint. It lets us know the server is running.
app.get('/', (req, res) => {
  res.json({ message: 'SIWES Placement API is running' });
});

export default app;
