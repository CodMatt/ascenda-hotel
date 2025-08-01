
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
  }
} as const;
