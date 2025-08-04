import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

import BaseRouter from '@src/routes';
import Paths from '@src/common/constants/Paths';
import ENV from '@src/common/constants/ENV';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { NodeEnvs } from '@src/common/constants';
import cors from 'cors';

// Database and Repositories
import Database from './models/db';
import UserRoutes from './repos/UserRepo';
import bookingRoutes from './repos/bookingRepo';
import nonAcctRoute from './repos/nonAccountRepo';

/******************************************************************************
                                Setup
******************************************************************************/
const app = express();

// **** Database Setup **** //
Database.initialize();

// Test database connection
Database.testConnection().then(isConnected => {
  if (!isConnected) {
    logger.err('Failed to connect to PostgreSQL database');
    process.exit(1);
  }
  
  // Sync all database tables
  Promise.all([
    UserRoutes.sync(),
    bookingRoutes.sync(),
    nonAcctRoute.sync()
  ]).then(() => {
    logger.info('All database tables synchronized');
  }).catch(err => {
    logger.err('Failed to sync database tables: ' + err);
  });
});

// **** Middleware **** //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development logging
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// CORS configuration
app.use(cors({
  origin: ENV.NodeEnv === NodeEnvs.Production 
    ? ['https://your-production-domain.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Security headers
if (ENV.NodeEnv === NodeEnvs.Production) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    },
    hsts: {
      maxAge: 63072000, // 2 years in seconds
      includeSubDomains: true,
      preload: true
    }
  }));
}

// API Routes
app.use(Paths.Base, BaseRouter);

// Error handling
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test) {
    logger.err(err, true);
  }

  if (err instanceof RouteError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Handle PostgreSQL errors specifically
  if (err.name === 'QueryFailedError') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ 
      error: 'Database error',
      details: err.message
    });
  }

  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error'
  });
});

// Health check endpoint
app.get('/health', (_: Request, res: Response) => {
  res.status(HttpStatusCodes.OK).json({ 
    status: 'healthy',
    database: 'PostgreSQL',
    environment: ENV.NodeEnv
  });
});

// **** Frontend Content (commented out as in original) **** //

export default app;