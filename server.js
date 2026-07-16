import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import dns from 'dns';
import connectDB from './src/config/db.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
