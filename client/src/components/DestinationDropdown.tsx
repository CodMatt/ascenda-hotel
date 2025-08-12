import React, { useState, useRef, useEffect } from "react";
import { useDestinations } from "../hooks/useDestinations";
import { Destination } from "../types/destination";
import "../styles/destinationDropdown.css";

let debounceTimer: ReturnType<typeof setTimeout>;

interface DestinationDropdownProps {
  onSelect: (destination: Destination) => void;
  selectedDestination: Destination | null;
}

export const DestinationDropdown: React.FC<DestinationDropdownProps> = ({
  onSelect,
  selectedDestination,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { destinations, loading, searchDestinations } = useDestinations();


  useEffect(() => {
    if (selectedDestination) {
      setInputValue(selectedDestination.term);
    } else {
      setInputValue("");
    }
  }, [selectedDestination]);


  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //handle input changes with debounce search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);

    if (!hasSearched) {
      setHasSearched(true); // First interaction
    }

    //debounce search (avoids too many API calls)
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchDestinations(value);
    }, 300);
  };

  // handle destination selection
  const handleSelect = (destination: Destination) => {
    onSelect(destination);
    setInputValue(destination.term);
    setIsOpen(false);
  };

  return (
    <div className="destination-dropdown" ref={dropdownRef}>
      {/* Input field for searching destinations */}
      <input
        id="destination"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search destinations..."
        className="dropdown-input"
      />
      {/* Dropdown menu for displaying search results*/}
      {isOpen && (
        <div className="dropdown-menu">
          {loading ? (
            <div className="dropdown-item">Loading...</div>
          ) : /* NO RESULTS STATE - Shows when no destinations found */
          destinations.length === 0 && hasSearched ? (
            <div className="dropdown-item no-results">
              No destinations found
            </div>
          ) : (
            /* RESULTS LIST - Individual destination items */
            destinations.map((destination) => (
              <div
                key={destination.uid}
                className="dropdown-item"
                onClick={() => handleSelect(destination)}
              >
                {/*DESTINATION TEXT - Shows destination name */}
                {destination.term}
                {/* STATE TEXT - Shows state if available (e.g., ", California") */}
                {destination.state && `, ${destination.state}`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* 
TODO: ADD CSS CLASSES TO STYLE THE COMPONENT
CSS CLASSES TO STYLE:

1. .destination-dropdown
   - Main container wrapper
   - Controls overall positioning and layout

2. .dropdown-input  
   - The search input field
   - Style the text input appearance, borders, padding, etc.

3. .dropdown-menu
   - The dropdown results container
   - Controls positioning, background, shadows, borders
   - Usually positioned absolutely below the input

4. .dropdown-item
   - Individual result items in the dropdown
   - Style hover effects, padding, text appearance
   - Used for both results and loading/no-results states

5. .dropdown-item.no-results
   - Specific styling for "No destinations found" message
   - Can be styled differently from regular items (e.g., italic, gray text)

KEY UI BEHAVIORS:
- Dropdown opens when input is focused or user types
- Dropdown closes when clicking outside or selecting an item  
- Shows loading state while searching
- Shows "no results" when search returns empty
- Each destination item is clickable
*/
