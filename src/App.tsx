import { useState } from 'react'

import './index.css' // make sure this is your Tailwind file
import Confirmation from './components/Confirmation'
import SuccessPage from './components/SuccessPage'
import PersonalInfoForm from './components/PersonalInfoForm'
import DummyPage from './components/DummyPage'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';





function App() {
  


  return (

    <Router>
      <Routes>
        <Route path="/" element={<DummyPage/>}/>

        <Route path="/bookingdetails" element={<PersonalInfoForm />} />

        <Route path="/payment" element={<Confirmation/> } />

        <Route path="/success" element={<SuccessPage />} />

      </Routes>
    </Router>
    

  )
}

export default App
