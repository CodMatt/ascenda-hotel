import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import CheckHotelDetailsPage from './pages/CheckHotelDetailsPage'
import DestinationSearchPage from './pages/DestinationSearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import GuestInfoPage from './pages/GuestInfoPage'
import {AuthProvider} from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'

import PaymentPage from './pages/PaymentPage'
import SuccessPage from './pages/SuccessPage'
import ViewBookingsPage from './pages/ViewBookingPage'
import GuestBookingLookupPage from './pages/GuestBookingLookupPage'
import GuestBookingAccessPage from './pages/GuestBookingAccessPage'



export default function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<DestinationSearchPage />} />
      <Route
            path="/HotelSearchPage"
            element={<HotelSearchPage />}
            />
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<RegisterPage/>}/>
      <Route path="/hotels/:id" element={<HotelDetailsPage />} /> // Placeholder 
      <Route path="/checkhoteldetailspage" element={<CheckHotelDetailsPage />} />
      <Route path="/guestinfo" element={<GuestInfoPage />} />
      <Route path='/payment' element={<PaymentPage/>}/>
      <Route path='/success' element={<SuccessPage/>}/>
      <Route path='/bookings' element={<ViewBookingsPage/>}/>
      <Route path='/guest-bookings' element={<GuestBookingLookupPage/>}/>
      <Route path="/guest-booking/:token" element={<GuestBookingAccessPage />} />



    </Routes>
    </AuthProvider>
  )
}
//for now its localhost:5173/login for login page
//localhost:5173/signup for signup page
//TODO: navigate to login and or signup once the register/ login button is clicked
