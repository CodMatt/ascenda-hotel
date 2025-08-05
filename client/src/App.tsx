import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import CheckHotelDetailsPage from './pages/CheckHotelDetailsPage'
import DestinationSearchPage from './pages/DestinationSearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import GuestInfoPage from './pages/GuestInfoPage'
import './styles/hotelSearch.css'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DestinationSearchPage />} />
      <Route
            path="/HotelSearchPage"
            element={<HotelSearchPage />}
            />
      <Route path="/hotels/:id" element={<HotelDetailsPage />} /> // Placeholder 
      <Route path="/checkhoteldetailspage" element={<CheckHotelDetailsPage />} />
      <Route path="/guestinfo" element={<GuestInfoPage />} />
    </Routes>
  )
}