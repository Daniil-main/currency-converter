import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Middleware
import { userMiddleware } from './middleware/user';

// Routes
import { currencyRoutes } from './routes/currencies';
import { ratesRoutes } from './routes/rates';
import { userRoutes } from './routes/user';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Custom middleware
app.use(userMiddleware);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Currency Converter API',
      version: '1.0.0',
      description: 'Backend application for currency conversion',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', currencyRoutes);
app.use('/api', ratesRoutes);
app.use('/api', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Currency Converter API is running!',
    endpoints: {
      currencies: 'GET /api/currencies',
      rates: 'GET /api/rates?base=USD&targets=EUR,GBP',
      user: 'GET /api/user',
      updateUser: 'POST /api/user',
      docs: 'GET /api-docs'
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;