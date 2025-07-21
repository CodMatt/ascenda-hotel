import { useEffect, useState, useRef } from "react";
import { fetchHotelPrices, fetchHotelsByDestination } from "../api/hotels";

export default function HotelSearchPage() {
  const [visibleCount, setVisibleCount] = useState(30); // start with 10
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "priceAsc" | "priceDesc" | "starAsc" | "starDesc">("none"); // Price and Star Filter
  const [filterStar, setFilterStar] = useState<number | null>(null); // filter for number of stars




  const destinationId = "RsBU"; // Fixed destination ID FOR NOW. 
  const checkin = "2025-10-01"; // Fixed checkin FOR NOW
  const checkout = "2025-10-07"; // Fixed checkout for now
  const guests = "2"; // Fixed no. of guests for now 

  // Fetching Hotel data
  useEffect(() => {
    async function loadHotels() {
      setLoading(true);
      setError(null);



      try {
        const [priceRes, hotelList] = await Promise.all([
          fetchHotelPrices(destinationId, checkin, checkout, guests),
          fetchHotelsByDestination(destinationId),
        ]);
        
        console.log("Total from /api/hotels:", hotelList.length);

        
        // ADD THIS RIGHT AFTER THE API CALL
        if (!priceRes || !Array.isArray(priceRes.hotels)) {
          throw new Error("priceRes.hotels is not a valid array");
        }
        
        const combined = hotelList.map((hotel: any) => {
          const priceMatch = priceRes.hotels?.find((p: any) => p.id === hotel.id);
          return {
            ...hotel,
            price: priceMatch?.price ?? null,
            hasPrice: !!priceMatch
          };
        });
        
        
        setHotelData(combined);

      } catch (err: any) {
        console.error(" Failed to load hotels:", err.message || err);
        setError("Failed to load hotel data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

  // lazy loading 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Lazy loading more hotels...");
          setVisibleCount((prev) => prev + 10);
        }
      },
      {
        root: null,         // observe in viewport
        rootMargin: "0px",
        threshold: 0.1      // trigger when 10% is visible
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
  
  

  // Sorting hotels based on price or rating  
const filteredHotels = filterStar
? hotelData.filter((hotel) => Math.floor(hotel.rating ?? 0) === filterStar)
: hotelData;

const sortedHotels =
  sortBy === "none"
    ? filteredHotels
    : [...filteredHotels].sort((a, b) => {
        if (sortBy === "starAsc") {
          return (a.rating ?? 0) - (b.rating ?? 0);
        } else if (sortBy === "starDesc") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        }

        const aHasPrice = a.price !== null;
        const bHasPrice = b.price !== null;

        if (!aHasPrice && !bHasPrice) return 0;
        if (!aHasPrice) return 1;
        if (!bHasPrice) return -1;

        if (sortBy === "priceAsc") {
          return a.price - b.price;
        } else if (sortBy === "priceDesc") {
          return b.price - a.price;
        }

        return 0;
      });


  

  return (
      <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Hotel Search Results</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        <button
          onClick={() => setSortBy("priceAsc")}
          className={`px-4 py-2 rounded ${
            sortBy === "priceAsc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Price: Low to High
        </button>

        <button
          onClick={() => setSortBy("priceDesc")}
          className={`px-4 py-2 rounded ${
            sortBy === "priceDesc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Price: High to Low
        </button>

        <button
          onClick={() => setSortBy("starAsc")}
          className={`px-4 py-2 rounded ${
            sortBy === "starAsc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Star: Low to High
        </button>

        <button
          onClick={() => setSortBy("starDesc")}
          className={`px-4 py-2 rounded ${
            sortBy === "starDesc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Star: High to Low
        </button>

        <button
          onClick={() => setSortBy("none")}
          className={`px-4 py-2 rounded ${
            sortBy === "none"
              ? "bg-gray-300 text-black"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          
          Clear All Sorts
        </button>

        // Star Filter 
        <div className="flex flex-wrap gap-4 mt-2">
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() =>
                setFilterStar((prev) => (prev === star ? null : star))
              }
              className={`px-4 py-2 rounded ${
                filterStar === star
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Only {star}-Star Hotels
            </button>
          ))}
        </div>
          
          {/* Clear Star Filter Button */}
        <button
          onClick={() => setFilterStar(null)}
          className="px-4 py-2 rounded bg-gray-300 text-black"
        >
          Clear Star Filter
        </button>
        
      </div>

      {loading && <p>Loading hotels...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && hotelData.length === 0 && (
        <p>No hotels found for the selected destination.</p>
      )}

      {!loading && !error && sortedHotels.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHotels.slice(0, visibleCount).map((hotel) => (
              <div key={hotel.id} className="bg-white shadow p-4 rounded">
                {hotel.image_details && hotel.default_image_index !== undefined ? (
                  <img
                    src={`${hotel.image_details.prefix}${hotel.default_image_index}${hotel.image_details.suffix}`}
                    alt={hotel.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-500 italic">
                    No image available
                  </div>
                )}

                <h2 className="text-xl font-semibold">{hotel.name}</h2>
                <p className="text-gray-500">⭐ {hotel.rating ?? "N/A"}</p>
                <p className="text-[#FF6B6B] font-bold">
                  {hotel.price !== null
                    ? `$${hotel.price.toFixed(2)}`
                    : <span className="text-gray-400 italic">Price not available</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Lazy loading  */}
          {visibleCount < sortedHotels.length && (
            <div
              ref={observerRef}
              className="h-20 mt-8 flex items-center justify-center bg-gray-100"
            >
              <p className="text-gray-400 text-sm">Loading more hotels...</p>
            </div>
          )}
        </>
      )}

    </div>
  );
}