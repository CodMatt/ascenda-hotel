import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchHotelDetails, fetchHotelRoomPrices } from "../api/hotels";

export default function HotelDetailsPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get these from search context or query params
  const destinationId = "RsBU";
  const checkin = "2025-10-01";
  const checkout = "2025-10-07";
  const guests = "2";

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const [hotelRes, priceRes] = await Promise.all([
          fetchHotelDetails(hotelId!),
          fetchHotelRoomPrices(hotelId!, destinationId, checkin, checkout, guests),
        ]);
        setHotel(hotelRes);
        setRooms(priceRes.rooms || []);
      } catch (err: any) {
        setError("Failed to load hotel details");
      } finally {
        setLoading(false);
      }
    }
    if (hotelId) loadDetails();
  }, [hotelId]);

  // TODO: Add polling for price freshness if needed

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!hotel) return <div>No hotel found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
      <p className="mb-2">{hotel.address}</p>
      <p className="mb-2">⭐ {hotel.rating}</p>
      <div className="mb-4">
        {/* Map component here */}
        <div style={{ height: "300px", width: "100%" }}>
          {/* TODO: Integrate Leaflet or Google Maps */}
          <span>Map goes here (lat: {hotel.latitude}, lng: {hotel.longitude})</span>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">Available Rooms</h2>
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div key={room.key} className="border rounded p-4">
            <h3 className="font-bold">{room.room_normalized_description}</h3>
            <p>{room.description}</p>
            <p>Price: ${room.price}</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}