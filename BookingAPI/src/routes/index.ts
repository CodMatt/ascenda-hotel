import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import BookingRoutes from './BookingRoutes';
import UserRoutes from './UserRoutes';
import noAcctRoutes from './noAcctRoutes';
import hotelRoutes from './hotelRoutes';
import stripeRoutes from './stripeRoutes';
import searchRoutes from './SearchRoutes';
import emailRoutes from './EmailRoutes';
/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.use(Paths.noAcct.Base, noAcctRoutes)
apiRouter.use(Paths.Booking.Base, BookingRoutes)
apiRouter.use(Paths.Users.Base, UserRoutes)
apiRouter.use(Paths.Hotels.Base, hotelRoutes)
apiRouter.use(Paths.Stripe.Base, stripeRoutes)
apiRouter.use(Paths.mongo.Base, searchRoutes)
apiRouter.use(Paths.Email.Base, emailRoutes);

// ** Add other routers here ** //
// Add more routers as needed
/******************************************************************************
                                Export default
******************************************************************************/


export default apiRouter;
