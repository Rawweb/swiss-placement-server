import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/coordinator', coordinatorRoutes);

// This is a simple health check endpoint. It lets us know the server is running.
app.get('/', (req, res) => {
  res.json({ message: 'SIWES Placement API is running' });
});

export default app;
