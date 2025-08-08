import { useEffect, useState, useRef } from "react";
import { fetchHotels } from "../api/hotels";
import MapboxMap from "../components/MapboxMap"; // adjust path if needed
import { useLocation, Link, useNavigate } from "react-router-dom";
import { sortHotels } from "../utils/sortHotels"; // filtering from high-low price fxn.
import "../styles/HotelSearchPage.css";
import logo from "../assets/logo.png";
import { ClipLoader } from "react-spinners";
import NavBar from "../components/NavBar";

export default function HotelSearchPage() {
  const [visibleCount, setVisibleCount] = useState(30); // Lazy loading state to control visibility
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [hotelData, setHotelData] = useState<any[]>([]); // Raw list hotels from api
  const [loading, setLoading] = useState(true); // Loading and Error State
  const [error, setError] = useState<string | null>(null);

  //const navigate = useNavigate();
  // Sorting + Filtering
  const [sortBy, setSortBy] = useState<
    "none" | "priceAsc" | "priceDesc" | "starAsc" | "starDesc"
  >("none");
  const [filterStar, setFilterStar] = useState<number | null>(null);

  // Parse URL Query Destination parameters
  const location = useLocation();
  //const searchParams = new URLSearchParams(location.search);
  const searchParams = (location.state as any)?.searchParams;
  const { destinationId, checkin, checkout, guests, adults, children } = searchParams ?? {};

  console.log(searchParams);

  // Use URL values if present, otherwise use fixed ones as shown RsBU (SG)
  /*const destinationId = searchParams.get("destination_id") ?? "RsBU"; // Fallback to RsBU 
  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const guests = searchParams.get("guests") ?? "";  */

  // Use navigate from react-router-dom to handle navigation
  const navigate = useNavigate();

  useEffect(() => {
    if (!destinationId || !checkin || !checkout || !guests) {
      console.error("Missing query params", {
        destinationId,
        checkin,
        checkout,
        guests,
      });
      setError("Missing required search parameters.");
      setLoading(false);
      return;
    }

    // Fetch hotel list based on query parameters
    async function loadHotels() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchHotels(
          destinationId,
          checkin,
          checkout,
          guests
        );
        console.log("Destination ID:", destinationId);

        console.log("Total hotels received:", result.hotels.length);
        setHotelData(result.hotels);
      } catch (err: any) {
        console.error("Failed to load hotels:", err.message || err);
        setError("Failed to load hotel data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, [destinationId, checkin, checkout, guests]);

  // Effect: Set up IntersectionObserver to lazy load more hotels on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Lazy loading more hotels...");
          setVisibleCount((prev) => prev + 10);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const current = observerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [observerRef.current]);

  // Filter hotels by star rating (with mathfloor if filter applied)
  const filteredHotels = filterStar
    ? hotelData.filter((hotel) => Math.floor(hotel.rating ?? 0) === filterStar)
    : hotelData;

  // Sort hotels by selected criteria (price or star rating)--> Taken from utils/sortHotels
  const sortedHotels = sortHotels(filteredHotels, sortBy);

  // Extract only hotels that have valid coordinates and format them for the MapboxMap
  const hotelsWithCoords = hotelData
    .filter((hotel) => hotel.latitude && hotel.longitude)
    .map((hotel) => ({
      id: hotel.id, // for routing
      name: hotel.name, // for display
      address: hotel.address,
      coordinates: {
        lat: hotel.latitude,
        lng: hotel.longitude,
      },
    }));

  // Calculate number of nights 
  function getNights(checkin: string, checkout: string): number {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
    
  const numNights = getNights(checkin, checkout);

  return (
    <div className="hotel-search-page">
      {/* -------- Header -------- */}
      <NavBar />

      {/* -------- Main scrollable content -------- */}
      <div className="content-wrapper">
        {/* -------- (Optional) Search summary card -------- */}
        {/* Uncomment if you’ve wired up `search-summary-card` */}
        {/* <div className="search-summary-card">
              <div className="summary-fields">
                <div className="field">
                  <div className="label">Destination</div>
                  <div className="value">{destination}</div>
                </div>
                <div className="field">
                  <div className="label">Check-in</div>
                  <div className="value">{checkin}</div>
                </div>
                <div className="field">
                  <div className="label">Check-out</div>
                  <div className="value">{checkout}</div>
                </div>
                <div className="field">
                  <div className="label">Guests</div>
                  <div className="value">{guests}</div>
                </div>
              </div>
              <div className="summary-actions">
                <button className="modify-btn" onClick={() => navigate(-1)}>
                  Modify Search
                </button>
              </div>
            </div> */}

        {/* -------- Results container -------- */}
        <div className="results-section">
          {/* (Optional) if you want sort controls in header */}
          {/* <div className="results-header">
                <button className="sort-button">Sort By ↓</button>
              </div> */}

          <div className="map-and-results">
            {/* -- Map panel -- */}
            <div className="map-container">
              <div className="map-wrapper">
                <MapboxMap
                  hotels={hotelsWithCoords}
                  onHotelSelect={(hotelId) => {
                    navigate(`/hotels/${hotelId}`, {
                      state: { hotelId, searchParams },
                    });
                  }}
                />
              </div>
            </div>

            {/* -- List + sort/filter panel -- */}
            <div className="list-container">
              <div className="sort-filter-bar">
                <div className="sort-dropdown">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="sort-select"
                  >
                    <option value="none">Sort By</option>
                    <option value="priceAsc">Price (low to high)</option>
                    <option value="priceDesc">Price (high to low)</option>
                    <option value="starAsc">Star Rating (low to high)</option>
                    <option value="starDesc">Star Rating (high to low)</option>
                  </select>
                </div>

                {/* <button
                      onClick={() => {
                        setSortBy("none");
                        setFilterStar(null);
                      }}
                      className="clear-btn"
                    >
                      Clear All
                    </button> */}

                {[5, 4, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setFilterStar((prev) => (prev === s ? null : s))
                    }
                    className={filterStar === s ? "active" : ""}
                  >
                    {s}-Star
                  </button>
                ))}
                <button
                  onClick={() => setFilterStar(null)}
                  className="clear-btn"
                >
                  Clear Star
                </button>
              </div>

              {/* -- Error / Loading states -- */}
              {loading && (
                <div className="loader-overlay">
                  <ClipLoader
                    size={60}
                    color="#0066cc"
                    loading={true}
                    aria-label="mutating-dots-loading"
                  />
                  <p>Fetching hotels...</p>
                </div>
              )}
              {error && <p className="error">{error}</p>}

              {/* -- Hotels grid -- */}
              {!loading && !error && (
                <div className="results-grid">
                  {sortedHotels.slice(0, visibleCount).map((hotel) => (
                    <Link
                      to={`/hotels/${hotel.id}`}
                      state={{
                        hotelId: hotel.id,
                        searchParams: {
                          destinationId,
                          checkin,
                          checkout,
                          guests,
                          adults,
                          children
                        },
                      }}
                      key={hotel.id}
                      className="hotel-card"
                    >
                      {hotel.image ? (
                        <img src={hotel.image} alt={hotel.name} />
                      ) : (
                        <div className="hotel-card__noimg">No image</div>
                      )}
                      <div className="hotel-info">
                        <h3>{hotel.name}</h3>
                        <p className="hotel-location">{hotel.address}</p>
                        <div className="hotel-rating">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`star ${
                                Math.floor(hotel.rating ?? 0) >= i
                                  ? "filled"
                                  : ""
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="rating-number">
                            {hotel.rating ?? "N/A"}
                          </span>
                        </div>
                        <div className="hotel-price">
                          {hotel.price != null
                            ? `$${(hotel.price/ numNights).toFixed(2)}`
                            : "Price N/A"}
                          <span className="per-night"> / night</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* -- Lazy-load sentinel -- */}
              {visibleCount < sortedHotels.length && (
                <div ref={observerRef} className="load-more">
                  <p className="message">Loading more hotels…</p>
                </div>
              )}

              {/* -- No results fallback -- */}
              {!loading && !error && sortedHotels.length === 0 && (
                <p className="message">No hotels found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
