import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/SuccessPage.css'
import BookingSuccessCard from "../components/BookingSuccessCard";
import { ClipLoader } from "react-spinners";

function SuccessPage() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // loading 
  const [saving, setSaving] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [fail, setFail] = useState(false);
  const navigate = useNavigate();

  // Disable back button during loading and saving
  useEffect(() => {
    if (loading || saving) {
      console.log('Success page loading/saving - disabling back button');
      
      window.history.pushState({ loading: true }, '', window.location.pathname);
      
      const handleBackButton = (event:any) => {
        console.log('Back button blocked during loading/saving');
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Please wait while we process your booking. Do not use the back button.');
        window.history.pushState({ loading: true }, '', window.location.pathname);
        return false;
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [loading, saving]);

  // After saving is complete, prevent going back to payment page
  useEffect(() => {
    if (!loading && !saving && bookingData) {
      console.log('Booking saved - setting up permanent back button protection');
      
      // Replace current history to remove payment page from history
      window.history.replaceState(null, '', window.location.pathname);
      window.history.pushState({ preventBack: true }, '', window.location.pathname);
      
      const handleBackButton = () => {
        console.log('Back button pressed after booking saved - redirecting to home');
        navigate('/');
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [loading, saving, bookingData, navigate]);

  async function saveBooking(bookingData: any) {
    if (!bookingData) {
      console.log('No booking data to save');
      return;
    }

    let contents = null;
    
    console.log('Saving booking data:', JSON.stringify(bookingData));
    
    if (bookingData.userRef) {
      contents = { // logged in
        nights: bookingData.duration,
        adults: bookingData.noAdults,
        children: bookingData.noChildren || 0,
        msg_to_hotel: bookingData.specialRequest || "",
        price: bookingData.totalPrice,
        user_ref: bookingData.userRef,
        dest_id: bookingData.destId,
        hotel_id: bookingData.hotelId,
        start_date: bookingData.checkin,
        end_date: bookingData.checkout,
      };
    } else {
      contents = { // no account
        nights: bookingData.duration,
        adults: bookingData.noAdults,
        children: bookingData.noChildren || 0,
        msg_to_hotel: bookingData.specialRequest || "",
        price: bookingData.totalPrice,
        dest_id: bookingData.destId,
        hotel_id: bookingData.hotelId,
        start_date: bookingData.checkin,
        end_date: bookingData.checkout,
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        salutation: bookingData.salutation,
        phone_num: bookingData.phoneNumber,
        email: bookingData.emailAddress,
        user_ref: null,
      };
    }

    if (contents) {
      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(contents)
        });

        console.log("response", response)
        const data = await response.json();
        console.log("responsee: ", data);

        if (response.ok) {
          setBookingId(data.booking_id);
          setSaving(false);
          return data; // Return the promise
        } else {
          console.log("check", data);
          setFail(true);
          setSaving(false);
        }

      } catch (error) {
        console.log(error);
        setFail(true);
        setSaving(false);
      }
    }
  } // <-- This was the missing closing bracket for the saveBooking function

  const startTime = Date.now();

  function tryLoad() {
    let sessionData = sessionStorage.getItem('pendingBookingData');
    
    if (loading) {
      if (sessionData) {
        setBookingData(JSON.parse(sessionData));
        setLoading(false);
      } else if (Date.now() - startTime > 300000) { // 5 minutes
        setLoading(false);
      }
    }
  }

  useEffect(() => { 
    tryLoad();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    if (saving && bookingData) {
      saveBooking(bookingData).then(() => {
        if (isMounted) setSaving(false);
      });
    }

    return () => { isMounted = false; };
  }, [saving, bookingData]);

  // Retrieving booking data from session storage
  if (loading) {
    return (
      <div className="loader-overlay">
        <ClipLoader
          size={60}
          color="#0066cc"
          loading={true}
          aria-label="mutating-dots-loading"
        />
        <p>Loading your booking confirmation...</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px',
          color: '#856404'
        }}>
          <strong>⚠️ Please do not use the back button while we load your booking</strong>
        </div>
      </div>
    );
  }

  // Failed to retrieve booking data from session storage
  if (!bookingData) {
    return (
      <div className="success-page">
        <h1>Error: No booking data found</h1>
        <p>Please contact support.</p>
      </div>
    );
  }

  // Saving to DB failed
  if (fail) {
    return <h1>
      Processing failed. Please contact support!
    </h1>
  }

  // Saving to DB
  if (saving) {
    return (
      <div className="loader-overlay">
        <ClipLoader
          size={60}
          color="#0066cc"
          loading={true}
          aria-label="mutating-dots-loading"
        />
        <p>Saving to database</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px',
          color: '#856404'
        }}>
          <strong>⚠️ Please do not use the back button while we save your booking</strong>
        </div>
      </div>
    );
  }
  
  // Booking Success
  return (
    <BookingSuccessCard 
      bookingId={bookingId}
      hotelName={bookingData.hotelName}
      hotelAddr={bookingData.hotelAddr}
      roomType={bookingData.roomType}
      checkin={bookingData.checkin}
      checkout={bookingData.checkout}
      duration={bookingData.duration}
      salutation={bookingData.salutation}
      firstName={bookingData.firstName}
      lastName={bookingData.lastName}
      phoneNumber={bookingData.phoneNumber}
      emailAddress={bookingData.emailAddress}
      noAdults={bookingData.noAdults}
      noChildren={bookingData.noChildren}
      specialRequest={bookingData.specialRequest}
      rates={bookingData.rates}
      totalPrice={bookingData.totalPrice}
      noRooms={bookingData.noRooms}
    />
  );
}

export default SuccessPage;