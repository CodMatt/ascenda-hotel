import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import server from './server';
import mongoose from 'mongoose';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = (
  'Express server started on port: ' + ENV.Port.toString()
);


/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
server.listen(ENV.Port, err => {
  if (!!err) {
    logger.err(err.message);
  } else {
    // Log the server start message
    logger.info(SERVER_START_MSG);
  }
});

mongoose.connect(process.env.MONGO_URI!)
.then(() => console.log('Connected to MongoDB atlas'))
.catch(err => console.error('MongoDB connection error:', err));
