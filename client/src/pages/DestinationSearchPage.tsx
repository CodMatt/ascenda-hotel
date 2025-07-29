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

        try{
            //redirect to results page with combined data
            navigate('/HotelSearchPage', {
                state: {
                    searchParams
                    
                }
            });
        } catch(err){
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