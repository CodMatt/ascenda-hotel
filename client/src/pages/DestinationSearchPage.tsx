//TODO
import React, { useState } from 'react';
import HotelSearchForm from '../components/HotelSearchForm';
import { useNavigate } from 'react-router-dom';


const DestinationSearchPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (searchParams: {
        destinationId: string; //uid from the destination
        checkin: string;
        checkout: string;
        guests: string;   
    }) => {
        console.log('Search params:', searchParams);
        //setIsLoading(true);
        //setError('');

        try {
            const { destinationId, checkin, checkout, guests } = searchParams;
            const queryString = `destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
            navigate(`/HotelSearchPage?${queryString}`);
          } catch (err) { 
            setError('Failed to search for hotels. Please try again.');
            console.error('Search error:', err);
          } finally {
            setIsLoading(false);
          }
    };
    return (
        <div className="hotel-search-page">
            <h1>Find Your Perfect Hotel</h1>
            <HotelSearchForm onSearch={handleSearch} />
            {isLoading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
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