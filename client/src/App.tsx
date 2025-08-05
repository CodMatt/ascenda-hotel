import { Routes, Route } from 'react-router-dom'
import HotelSearchPage from './pages/HotelSearchPage'
import DestinationSearchPage from './pages/DestinationSearchPage'
import {AuthProvider} from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'

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
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<RegisterPage/>}/>
    </Routes>
    </AuthProvider>
  )
}
//for now its localhost:5173/login for login page
//localhost:5173/signup for signup page
//TODO: navigate to login and or signup once the register/ login button is clicked
