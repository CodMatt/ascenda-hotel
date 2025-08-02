import { Routes, Route, BrowserRouter } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import DestinationSearchPage from './pages/DestinationSearchPage'
import {AuthProvider} from './context/AuthContext';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm'

import './styles/hotelSearch.css'
export default function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<DestinationSearchPage />} />
      <Route
            path="/HotelSearchPage"
            element={<HotelSearchPage />}
            />
      <Route path="/login" element={<LoginForm/>}/>
      <Route path="/signup" element={<SignupForm/>}/>
    </Routes>
    </AuthProvider>
  )
}
