import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HotelSearchPage />} />
      <Route path="/hotel/:hotelId" element={<HotelDetailsPage />} />
    </Routes>
  )
}
