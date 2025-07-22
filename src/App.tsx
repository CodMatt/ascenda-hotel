import { useState } from 'react'

import './index.css' // make sure this is your Tailwind file
import Confirmation from './components/Confirmation'
import SuccessPage from './components/SuccessPage'
import PersonalInfoForm from './components/PersonalInfoForm'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';




class Booking {
  id;
  key;
  name;
  rates;
  duration;
  checkin;
  checkout;
  noAdults;
  noChildren;

  constructor(id: string, key: string, name: string, 
    rates: number, duration: number, checkin: Date, checkout: Date,
    noAdults: number, noChildren: number){
    this.id = id;
    this.key = key;
    this.name = name;
    this.rates = rates;
    this.duration = duration;
    this.checkin = checkin;
    this.checkout = checkout;
    this.noAdults = noAdults;
    this.noChildren = noChildren;
  }
}



function App() {
  const dummyDate = new Date();

  const dummyDate2 = new Date();
  dummyDate2.setDate(dummyDate2.getDate() + 2);

  const dummyData = new Booking("dummyId", "dummyKey", "dummyName", 105.20, 2, dummyDate, dummyDate2, 2, 1);


  return (

    <Router>
      <Routes>
        <Route path="/bookingdetails" element={<PersonalInfoForm />} />

        <Route path="/payment" element={<Confirmation id = {dummyData.id} key = {dummyData.key} 
      name = {dummyData.name} rates = {dummyData.rates} 
      duration = {dummyData.duration}
      checkin = {dummyData.checkin} checkout = {dummyData.checkout}
      noAdults = {dummyData.noAdults}  noChildren = {dummyData.noChildren}/> } />

        <Route path="/success" element={<SuccessPage />} />

      </Routes>
    </Router>
    

  )
}

export default App
