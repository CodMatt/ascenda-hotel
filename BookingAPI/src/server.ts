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

//models
import Database from './models/db';

/******************************************************************************
                                Setup
******************************************************************************/
/* 
 * settings up a basic express server to get information from the database
*/

const bookingRoutes = require('./repos/bookingRepo');
const UserRoutes = require('./repos/UserRepo');

const app = express();

// **** Database Setup **** //
Database.initialize();
Database.testConnection().then(isConnected =>{
    if(!isConnected){
      process.exit(1);
    }
  });

// Sync booking routes
// This will create the table if it does not exist
// and will not delete existing data
bookingRoutes.sync();
UserRoutes.sync();

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

// end database setup

// **** FrontEnd Content **** //

// Set views directory (html)
// const viewsDir = path.join(__dirname, 'views');
// app.set('views', viewsDir);

// // Set static directory (js and css).
// const staticDir = path.join(__dirname, 'public');
// app.use(express.static(staticDir));

// // Nav to users pg by default
// app.get('/', (_: Request, res: Response) => {
//   return res.redirect('/forms');
// });

// // Redirect to login if not logged in.
// app.get('/forms', (_: Request, res: Response) => {
//   return res.sendFile('booking.html', { root: viewsDir });
// });


/******************************************************************************
                                Export default
******************************************************************************/

export default app;
