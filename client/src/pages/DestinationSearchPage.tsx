//TODO
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HotelSearchForm from "../components/HotelSearchForm";
import "../styles/DestinationSearchPage.css";
import logo from "../assets/logo.png";
import NavBar from "../components/NavBar";
import video from "../assets/jet2otomatone.mp4";  //jet2 holiday

const DestinationSearchPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  /*const videoRef = useRef<HTMLVideoElement>(null);  //jet2holiday

  //jet2 holiday useEffect
  useEffect(() => {
    // Try to autoplay with sound when component mounts
    const attemptPlay = () => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            // Autoplay worked
          })
          .catch(error => {
            // Autoplay was prevented, show controls
            if (videoRef.current) {
              videoRef.current.controls = true;
            }
          });
      }
    };
    attemptPlay();
  }, []);*/

  const handleSearch = async (searchParams: {
    destinationId: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    guests: string;
    lang?: string;
    currency?: string;
    country_code?: string;
  }) => {
    setIsLoading(true);
    setError("");
    
  
    try {
      //const { destinationId, checkin, checkout, guests } = searchParams;
      //const queryString = `destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
      //console.log(searchParams);
      navigate("/HotelSearchPage", {
        state: {
          searchParams,
        },
      });
      //navigate(`/HotelSearchPage?${queryString}`);
    } catch (err) {
      setError("Failed to search for hotels. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="destination-page-wrapper">
      <NavBar/>
      <main className="dsp-main">
        <section className="hero">
          <div className="hero-text">
            <h1>Discover Your Perfect Stay</h1>
            <p className="subtitle">
              Search availability, pick dates, and customise guests & rooms.
            </p>
          </div>
          <div className="form-wrapper">
            <HotelSearchForm onSearch={handleSearch} />
            {isLoading && (
              <div className="status-message loading">Loading...</div>
            )}
            {error && <div className="status-message error">{error}</div>}
          </div>
        </section>
      </main>
      
      <footer className="dsp-footer">
        {/* jet2 holiday */}
        {/*<div className="footer-video-container">
          <video ref={videoRef} autoPlay loop className="footer-video" width="600" height="300">
            <source src={video} type="video/mp4"/>
            Your browser does not support the video tag
          </video>
        </div>*/}
        <div className="footer-block">
          <div className="footer-title">Ascenda</div>
          <div className="footer-text">
            Trusted accommodations worldwide. Simple search. Transparent
            pricing.
          </div>
        </div>
        <div className="footer-block">
          <div className="footer-title">Quick Links</div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Support</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DestinationSearchPage;