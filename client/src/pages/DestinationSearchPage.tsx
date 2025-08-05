//TODO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelSearchForm from '../components/HotelSearchForm';
import '../styles/destinationSearchPage.css';
import logo from '../assets/logo.png';

const DestinationSearchPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    setError('');

    try {
      navigate('/HotelSearchPage', {
        state: {
          searchParams,
        },
      });
    } catch (err) {
      setError('Failed to search for hotels. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="destination-page-wrapper">
      <header className="dsp-header">
        <div className="dsp-logo">
            <img src={logo} alt="Ascenda logo" className="logo-img" />
        </div>
        {/* <nav className="dsp-nav">
          <a href="#" className="nav-link">
            Destinations
          </a>
          <a href="#" className="nav-link">
            Deals
          </a>
          <a href="#" className="nav-link">
            Help
          </a>
        </nav> */}
        <div className="dsp-actions">
          <button className="btn-outline">Sign In</button>
          <button className="btn-primary">Register</button>
        </div>
      </header>

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
            {isLoading && <div className="status-message loading">Loading...</div>}
            {error && <div className="status-message error">{error}</div>}
          </div>
        </section>
      </main>

      <footer className="dsp-footer">
        <div className="footer-block">
          <div className="footer-title">Ascenda</div>
          <div className="footer-text">
            Trusted accommodations worldwide. Simple search. Transparent pricing.
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

/* TODO
CSS CLASSES TO STYLE:

1. .hotel-search-page
   - Main page container
   - Controls overall page layout, background, centering
   - Should handle responsive design and page-level spacing

2. h1 (Page Title)
   - Main page heading "Find Your Perfect Hotel"
   - Typography styling, color, spacing from form
   - Usually larger, bold, centered or left-aligned

3. .error (Error Message)
   - Error text styling for search failures
   - Usually red/warning colors, may need icons
   - Should be noticeable but not overwhelming

4. Loading message (p element)
   - "Loading..." text that appears during search
   - May want loading spinner or animation
   - Usually centered or positioned near search button

KEY UI BEHAVIORS:
- Page starts with no loading/error states
- When search is submitted, briefly shows loading (currently commented out)
- On search success, navigates to results page
- On search failure, shows error message
- Form validation errors are handled within HotelSearchForm component

DESIGN CONSIDERATIONS FOR YOUR FRIEND:

PAGE LAYOUT:
- .hotel-search-page should be the main page container
- Consider centering content or using max-width for desktop
- Add appropriate padding/margins for mobile

VISUAL HIERARCHY:
- h1 should be prominent and welcoming
- Clear separation between title and form
- Loading/error states should be positioned logically

RESPONSIVE DESIGN:
- Ensure page works well on mobile devices
- Form should be the main focus of the page
- Consider hero section styling around the title

LOADING/ERROR STATES:
- Loading message could have a spinner animation
- Error styling should match your design system
- Both should be positioned where users expect feedback

INTEGRATION:
- This page contains the HotelSearchForm component
- Make sure page styling complements form styling
- Consider overall color scheme and spacing consistency
*/