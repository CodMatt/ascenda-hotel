import React, {useState, useRef, useEffect} from 'react';
import {useDestinations} from '../hooks/useDestinations';
import {Destination} from '../types/destination';
import '../styles/destinationDropdown.css';


let debounceTimer: ReturnType<typeof setTimeout>;

interface DestinationDropdownProps {
  onSelect: (destination: Destination) => void;
  selectedDestination: Destination | null;
}

export const DestinationDropdown: React.FC<DestinationDropdownProps> = ({ 
  onSelect, 
  selectedDestination 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { destinations, loading, searchDestinations } = useDestinations();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    searchDestinations(value);
    setIsOpen(true);

    //debounce search
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() =>{
    searchDestinations(value); 
  }, 300);
  };

  
  const handleSelect = (destination: Destination) => {
    onSelect(destination);
    setInputValue(destination.term);
    setIsOpen(false);
  };

  return (
    <div className="destination-dropdown" ref={dropdownRef}>
      <input
        type="text"
        value={selectedDestination?.term || inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search destinations..."
        className="dropdown-input"
      />
      
      {isOpen && (
        <div className="dropdown-menu">
          {loading ? (
            <div className="dropdown-item">Loading...</div>
          ) : destinations.length === 0 ? (
            <div className="dropdown-item no-results">No destinations found</div>
          ) : (
            destinations.map(destination => (
              <div
                key={destination.uid}
                className="dropdown-item"
                onClick={() => handleSelect(destination)}
              >
                {destination.term}
                {destination.state && `, ${destination.state}`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};