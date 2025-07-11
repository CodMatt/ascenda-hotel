import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import server from './server';


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
    console.log("this works");
    logger.info(SERVER_START_MSG);
  }
});
