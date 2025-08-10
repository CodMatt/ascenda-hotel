
export default {
  Base: '/api',
  Booking: {
    Base: '/booking',
    Details: '/booking/details',
    Update:'/booking/update',
    MyBookings:'/booking/my-booking'
  },
  Users:{
    Base:'/users'
  },
  noAcct:{
    Base:'/Details'
  },
  Hotels:{
    Base:'/Hotels'
  },
  Stripe:{
    Base:'/stripe'
  },
  mongo:{
    Base:'/destinations'
  },
  Email: {  // Add this section
    Base: '/email',
    SendAccess: '/email/send-booking-access',
    GuestBooking: '/email/guest-booking',
    ResendAccess: '/email/resend-booking-access'
  }
} as const;
