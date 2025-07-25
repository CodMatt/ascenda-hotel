  import { useParams } from "react-router-dom";
  import { useEffect, useState } from "react";
  import { fetchHotelDetails, fetchHotelRoomPrices } from "../api/hotels";
  import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";

  //Replace icons
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

    const query = new URLSearchParams(window.location.search);

    const destinationId = query.get("destination_id") || "WD0M";
    const checkin = query.get("checkin") || "2025-10-11";
    const checkout = query.get("checkout") || "2025-10-17";
    const guests = query.get("guests") || "2";

    useEffect(() => {
      async function loadDetails() {
        console.log("=== Fetching Hotel Details ===");
        console.log("hotelId:", hotelId);
        console.log("destinationId:", destinationId);
        console.log("checkin:", checkin);
        console.log("checkout:", checkout);
        console.log("guests:", guests);
        setLoading(true);
        setError(null);
        try {
          
          const [hotelRes, priceRes] = await Promise.all([
            fetchHotelDetails(hotelId!),
            fetchHotelRoomPrices(hotelId!, destinationId, checkin, checkout, guests),
          ]);
          setHotel(hotelRes);
          setRooms(priceRes.rooms || []);
          console.log("Hotel response:", hotelRes);
          console.log("Room response:", priceRes);
          console.log("Rooms array:", priceRes.rooms);
        } catch (err: any) {
          console.error("Failed to fetch data:", err);
          setError("Failed to load hotel details");
        } finally {
          setLoading(false);
        }
      }
      if (hotelId) loadDetails();
    }, [hotelId]);



    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!hotel) return <div>No hotel found.</div>;

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
        <p className="mb-2">{hotel.address}</p>
        <p className="mb-2">⭐ {hotel.rating}</p>
        <p className="mb-4">{hotel.description}</p>

        {/* Images */}
        {hotel.image_details && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Photos</h2>
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: hotel.image_details.count }).map((_, idx) => (
                <img
                  key={idx}
                  src={`${hotel.image_details.prefix}${idx}${hotel.image_details.suffix}`}
                  alt={`Hotel image ${idx + 1}`}
                  className="h-40 rounded shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Amenities</h2>
            <ul className="list-disc list-inside">
              {hotel.amenities.map((amenity: string, index: number) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Map */}
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

        {/* Rooms */}
        <h2 className="text-2xl font-semibold mb-2">Available Rooms</h2>
        {rooms.length === 0 ? (
          <p>No available rooms found for your selected dates.</p>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div key={room.key} className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <h3 className="font-bold text-lg">
                    {room.room_normalized_description || "Room"}
                  </h3>
                  <p className="text-blue-600 text-lg font-semibold">
                    ${room.price} <span className="text-sm font-normal">per night</span>
                  </p>
                </div>
                <p className="text-sm text-gray-700 mb-2">{room.description}</p>
                {room.refundable !== undefined && (
                  <p className={`text-sm ${room.refundable ? "text-green-600" : "text-red-500"}`}>
                    {room.refundable ? "Refundable" : "Non-refundable"}
                  </p>
                )}
                {room.supplier && (
                  <p className="text-xs text-gray-500 mt-1">Powered by {room.supplier}</p>
                )}
                <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Select Room
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    );
  }