import React, { useState } from 'react';
import Home        from './components/Home';
import SearchPage  from './components/SearchPage';
// import Payment     from './components/Payment';
// import Success     from './components/Success';
import "./styles/App.css";
import SignIn from "./components/SignIn";
import Register   from "./components/Register";


function App() {
  // ——— Page routing ———
  const [currentPage, setCurrentPage] = useState('home');

  // ——— Shared search state ———
  const [destination,  setDestination]  = useState('');
  const [checkIn,      setCheckIn]      = useState('');
  const [checkOut,     setCheckOut]     = useState('');
  const [guests,       setGuests]       = useState('');

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData,  setBookingData]  = useState({
    checkIn: '',
    checkOut: '',
    totalAmount: 854
  });
  const [paymentData,  setPaymentData]  = useState({
    cardNumber: '',
    cardHolder: '',
    expDate: '',
    cvv: ''
  });

  // collect everything to pass down via props
  const appData = {
    currentPage,
    setCurrentPage,
    // search props
    destination,
    setDestination,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    // other props
    selectedRoom,
    setSelectedRoom,
    bookingData,
    setBookingData,
    paymentData,
    setPaymentData
  };

  // decide which page to render
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home {...appData} />;
      case 'search':
        return <SearchPage {...appData} />;
      case 'signin':
        return <SignIn />;
      case 'register':
        return <Register />;
      // case 'payment':
      //   return <Payment {...appData} />;
      // case 'success':
      //   return <Success {...appData} />;
      default:
        return <Home {...appData} />;
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}

export default App;
