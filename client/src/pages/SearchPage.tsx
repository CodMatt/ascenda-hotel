import React, { useState } from "react";
import "../styles/hotels.css";
import logo from "../assets/logo.png";

interface SearchPageProps {
  setCurrentPage: (page: string) => void;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}

// sort options
const SORT_OPTIONS = [
  { label: "Price (low to high)",  value: "priceLowHigh"  },
  { label: "Price (high to low)",  value: "priceHighLow"  },
  { label: "Star Rating (low to high)", value: "ratingLowHigh" },
  { label: "Star Rating (high to low)", value: "ratingHighLow" },
];

const hotels = [
  { id: 1, name: "Ocean Paradise Resort", location: "Maldives • Beachfront", rating: 4.9, price: 299 },
  { id: 2, name: "Alpine Mountain Lodge",  location: "Switzerland • Mountain View", rating: 4.7, price: 189 },
  { id: 3, name: "Metropolitan Tower",       location: "New York • City Center",     rating: 4.8, price: 249 },
  { id: 4, name: "Ocean Paradise Resort", location: "Maldives • 5‑star luxury resort", rating: 4.9, price: 299 },
  { id: 5, name: "Grand City Hotel",     location: "New York • Business hotel", rating: 4.7, price: 189 },
  { id: 6, name: "Alpine Lodge",         location: "Switzerland • Mountain retreat", rating: 4.8, price: 249 },
];

const SearchPage: React.FC<SearchPageProps> = ({
  setCurrentPage,
  destination,
  checkIn,
  checkOut,
  guests,
}) => {
  // dropdown open/close & selection
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);

  // sort logic
  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":  return a.price - b.price;
      case "priceHighLow":  return b.price - a.price;
      case "ratingLowHigh": return a.rating - b.rating;
      case "ratingHighLow": return b.rating - a.rating;
      default:              return 0;
    }
  });

  // label in button
  const selectedLabel =
    sortOption
      ? SORT_OPTIONS.find(opt => opt.value === sortOption)?.label
      : "Sort By";

  return (
    <div className="searchpage">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Ascenda logo" />
          <span>Ascenda</span>
        </div>
        <nav className="nav-links">
          <a href="#">Destinations</a>
          <a href="#">Deals</a>
          <a href="#">About Us</a>
        </nav>
        <div className="auth-buttons">
          <button className="signin-btn">Sign In</button>
          <button className="register-btn">Register</button>
        </div>
      </header>

      {/* Search Bar (readonly) */}
      <section className="search-section">
        <div className="search-box">
          <div className="search-field">
            <label>Destination</label>
            <input type="text" value={destination} readOnly />
          </div>
          <div className="search-field">
            <label>Check-in</label>
            <input type="text" value={checkIn} readOnly />
          </div>
          <div className="search-field">
            <label>Check-out</label>
            <input type="text" value={checkOut} readOnly />
          </div>
          <div className="search-field">
            <label>Guests</label>
            <input type="text" value={guests} readOnly />
          </div>
        </div>
        <button
          className="edit-search-btn"
          onClick={() => setCurrentPage("home")}
        >
          Modify Search
        </button>
      </section>

      {/* Results Section */}
      <section className="results-section">

        {/* ←– New sort dropdown header */}
        <div className="results-header">
          <div className="sort-dropdown">
            <button
              className="sort-button"
              onClick={() => setShowSortMenu(open => !open)}
            >
              {selectedLabel} <span style={{ marginLeft: 6 }}>▾</span>
            </button>

            {showSortMenu && (
              <ul className="sort-menu">
                {SORT_OPTIONS.map(opt => (
                  <li
                    key={opt.value}
                    className="sort-menu-item"
                    onClick={() => {
                      setSortOption(opt.value);
                      setShowSortMenu(false);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="results-grid">
          {sortedHotels.map(hotel => (
            <div key={hotel.id} className="hotel-card">
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  backgroundColor: "#eee",
                }}
              />
              <div className="hotel-info">
                <h3>{hotel.name}</h3>
                <p className="hotel-location">{hotel.location}</p>
                <div className="hotel-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(hotel.rating)
                          ? "star filled"
                          : "star"
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-number">{hotel.rating}</span>
                </div>
                <div className="hotel-price">
                  <span>${hotel.price}</span>
                  <span className="per-night"> per night</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-col">
          <h3>Ascenda</h3>
          <p>
            Your trusted partner for finding the perfect accommodation worldwide.
          </p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;