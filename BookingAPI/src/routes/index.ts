import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import BookingRoutes from './BookingRoutes';
import UserRoutes from './UserRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.use(Paths.Booking.Base, BookingRoutes)
apiRouter.use(Paths.Users.Base, UserRoutes)

// ** Add other routers here ** //
// Add more routers as needed
/******************************************************************************
                                Export default
******************************************************************************/







export default apiRouter;
