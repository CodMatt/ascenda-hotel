import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchHotelDetails, fetchHotelRoomPrices } from "../api/hotels";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
        <div className="mb-4" style={{ height: "300px", width: "100%" }}>
          <MapContainer
            center={[hotel.latitude, hotel.longitude]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[hotel.latitude, hotel.longitude]}>
              <Popup>
                {hotel.name}
                <br />
                {hotel.address}
              </Popup>
            </Marker>
          </MapContainer>
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