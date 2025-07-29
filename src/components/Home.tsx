import React, { useState } from "react";
import "./../styles/App.css";
import Calendar from "./Calendar";
import logo from "../assets/logo.png";

interface HomeProps {
  setCurrentPage: (page: string) => void;
  destination: string;
  setDestination: (dest: string) => void;
  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;
  guests: string;
  setGuests: (guests: string) => void;
}

const Home: React.FC<HomeProps> = ({
  setCurrentPage,
  destination,
  setDestination,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
}) => {
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const [dates, setDates] = useState<{ checkIn: string; checkOut: string }>({
    checkIn: "",
    checkOut: "",
  });

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [calendarTarget, setCalendarTarget] = useState<"checkIn" | "checkOut" | "">("");

  const openCalendar = (field: "checkIn" | "checkOut") => {
    setCalendarTarget(field);
    setShowCalendar(true);
  };

  const handleDateSelect = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    const formatted = `${month}/${day}/${year}`;
    setDates((prev) => ({ ...prev, [calendarTarget]: formatted }));

    if (calendarTarget === "checkIn") {
      setCheckIn(formatted);
    } else {
      setCheckOut(formatted);
    }
    setShowCalendar(false);
  };

  return (
    <div className="home">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Ascenda logo" />
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

      <section className="hero">
        <div className="overlay">
          <h1>Discover Your Perfect Stay</h1>
          <p>
            Unforgettable experiences await. Find the ideal accommodation for
            your next adventure.
          </p>

          <div className="search-box">
            <div className="search-field">
              <label>Where are you going?</label>
              <input
                type="text"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label>Check‑in</label>
              <div
                className="date-input"
                onClick={() => openCalendar("checkIn")}
              >
                <span>{dates.checkIn || "mm/dd/yyyy"}</span>
                <i className="calendar-icon"> </i>
              </div>
            </div>

            <div className="search-field">
              <label>Check‑out</label>
              <div
                className="date-input"
                onClick={() => openCalendar("checkOut")}
              >
                <span>{dates.checkOut || "mm/dd/yyyy"}</span>
                <i className="calendar-icon"></i>
              </div>
            </div>

            <div className="guest-section">
              <label>Guests</label>
              <div className="guest-box">
                <div className="guest-counter">
                  <span>Adults</span>
                  <div className="counter-controls">
                    <button onClick={() => setAdults((a) => Math.max(1, a - 1))}>
                      −
                    </button>
                    <span>{adults}</span>
                    <button onClick={() => setAdults((a) => a + 1)}>+</button>
                  </div>
                </div>
                <div className="guest-counter">
                  <span>Children</span>
                  <div className="counter-controls">
                    <button
                      onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    >
                      −
                    </button>
                    <span>{children}</span>
                    <button onClick={() => setChildren((c) => c + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="search-btn"
              onClick={() => {
                setGuests(
                  `${adults} Adult${adults > 1 ? "s" : ""}${
                    children > 0
                      ? `, ${children} Child${children > 1 ? "ren" : ""}`
                      : ""
                  }`
                );
                setCurrentPage("search");
              }}
            >
              Search
            </button>
          </div>

          {showCalendar && (
            <Calendar
              onDateSelect={handleDateSelect}
              onClose={() => setShowCalendar(false)}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
