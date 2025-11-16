import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import userRoutes from './routes/users';
import roomRoutes from './routes/rooms';
import tenantRoutes from './routes/tenants';
import serviceRoutes from './routes/services';
import contractRoutes from './routes/contracts';
import utilityReadingRoutes from './routes/utility-readings';
import maintenanceRoutes from './routes/maintenance';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/utility-readings', utilityReadingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
  });
