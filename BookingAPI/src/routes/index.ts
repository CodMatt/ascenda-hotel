import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import BookingRoutes from './BookingRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ** Add BookingRouter ** //
apiRouter.use(Paths.Booking.Base, BookingRoutes)

// ** Add other routers here ** //
// Add more routers as needed
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
