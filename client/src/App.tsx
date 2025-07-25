import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HotelSearchPage />} />
      <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
    </Routes>
  )
}
