import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import DummyPage from './pages/dummyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HotelSearchPage />} />
      <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
      <Route path="/dummypage" element={<DummyPage />} />
    </Routes>
  )
}
