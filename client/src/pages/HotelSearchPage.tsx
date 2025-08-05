import { useEffect, useState, useRef } from "react";
import { fetchHotels } from "../api/hotels";
import MapboxMap from '../components/MapboxMap'; // adjust path if needed
import { useLocation, Link } from "react-router-dom"; 
import { sortHotels } from '../utils/sortHotels'; // filtering from high-low price fxn.  



export default function HotelSearchPage() {
  const [visibleCount, setVisibleCount] = useState(30); // Lazy loading state to control visibility 
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [hotelData, setHotelData] = useState<any[]>([]); // Raw list hotels from api 
  const [loading, setLoading] = useState(true); // Loading and Error State 
  const [error, setError] = useState<string | null>(null);

  // Sorting + Filtering 
  const [sortBy, setSortBy] = useState<"none" | "priceAsc" | "priceDesc" | "starAsc" | "starDesc">("none");
  const [filterStar, setFilterStar] = useState<number | null>(null);

  // Parse URL Query Destination parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Use URL values if present, otherwise use fixed ones as shown RsBU (SG)
  const destinationId = searchParams.get("destination_id") ?? "RsBU"; // Fallback to RsBU 
  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const guests = searchParams.get("guests") ?? "";  

  useEffect(() => {
    if (!destinationId || !checkin || !checkout || !guests) {
      console.error("Missing query params", { destinationId, checkin, checkout, guests });
      setError("Missing required search parameters.");
      setLoading(false);
      return;
    }
  

    // Fetch hotel list based on query parameters
    async function loadHotels() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchHotels(destinationId, checkin, checkout, guests);
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
        threshold: 0.1
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
      .filter((hotel) => hotel.latitude && hotel.longitude) // Filter no lat/lng hotels
      .map((hotel) => ({ // map filtered hotels by mapboxmap
        name: hotel.name, 
        address: hotel.address,
        coordinates: {
          lat: hotel.latitude,
          lng: hotel.longitude,
        },
      }));

  
  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Hotel Search Results</h1>
      <MapboxMap
        hotels={hotelsWithCoords}
        onHotelSelect={(hotelName) => {
          console.log("Hotel selected from map:", hotelName);
          <Link to={`/hotels/${hotelName}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`} />
          // TODO: redirect to hotel details upon clicking 
        }}
      />

      <div className="mb-4 flex flex-wrap gap-4">
        <button onClick={() => setSortBy("priceAsc")} className={`px-4 py-2 rounded ${sortBy === "priceAsc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Price: Low to High</button>
        <button onClick={() => setSortBy("priceDesc")} className={`px-4 py-2 rounded ${sortBy === "priceDesc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Price: High to Low</button>
        <button onClick={() => setSortBy("starAsc")} className={`px-4 py-2 rounded ${sortBy === "starAsc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Star: Low to High</button>
        <button onClick={() => setSortBy("starDesc")} className={`px-4 py-2 rounded ${sortBy === "starDesc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Star: High to Low</button>
        <button onClick={() => setSortBy("none")} className={`px-4 py-2 rounded ${sortBy === "none" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-800"}`}>Clear All Sorts</button>

        <div className="flex flex-wrap gap-4 mt-2">
          {[5, 4, 3].map((star) => (
            <button key={star} onClick={() => setFilterStar((prev) => (prev === star ? null : star))} className={`px-4 py-2 rounded ${filterStar === star ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-800"}`}>Only {star}-Star Hotels</button>
          ))}
        </div>

        <button onClick={() => setFilterStar(null)} className="px-4 py-2 rounded bg-gray-300 text-black">Clear Star Filter</button>
      </div>

      {loading && <p>Loading hotels...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && hotelData.length === 0 && <p>No hotels found for the selected destination.</p>}

      {!loading && !error && sortedHotels.length > 0 && (
        <> // Place holder for HotelDetails Page 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHotels.slice(0, visibleCount).map((hotel) => (
              <Link to={`/hotels/${hotel.id}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`} key={hotel.id} className="block"
              >
                  <div className="bg-white shadow p-4 rounded hover:shadow-lg transition">
                  {hotel.image ? (
                    <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-500 italic">
                      No image available
                    </div>
                  )}

                  <h2 className="text-xl font-semibold">{hotel.name}</h2>
                  <p className="text-gray-500">⭐ {hotel.rating ?? "N/A"}</p>
                  <p className="text-[#FF6B6B] font-bold">
                    {hotel.price !== null ? `$${hotel.price.toFixed(2)}` : (
                      <span className="text-gray-400 italic">Price not available</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {visibleCount < sortedHotels.length && (
            <div ref={observerRef} className="h-20 mt-8 flex items-center justify-center bg-gray-100">
              <p className="text-gray-400 text-sm">Loading more hotels...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
  