import { useState } from 'react'

import './index.css' // make sure this is your Tailwind file
import Confirmation from './components/Confirmation'
import SuccessPage from './components/SuccessPage'
import GuestInfoForm from './components/GuestInfoForm'
import DummyPage from './components/DummyPage'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';





function App() {
  


  return (

    <Router>
      <Routes>
        <Route path="/" element={<DummyPage/>}/>

        <Route path="/guestinfo" element={<GuestInfoForm />} />

        <Route path="/payment" element={<Confirmation/> } />

        <Route path="/success" element={<SuccessPage />} />

      </Routes>
    </Router>
    

  )
}

export default App
