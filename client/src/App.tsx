import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HotelSearchPage />} />
    </Routes>
  )
}
