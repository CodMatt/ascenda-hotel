import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchHotelDetails, fetchHotelRoomPrices } from "../api/hotels";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/HotelDetailsPage.css";
import NavBar from "../components/NavBar";
import calculateNights from "../lib/CalculateNights";

//Replace icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ImageCarousel component with error handling and image counter
  function ImageCarousel({
    prefix,
    suffix,
    count,
  }: {
    prefix: string;
    suffix: string;
    count: number;
  }) {
    const [currentValidIndex, setCurrentValidIndex] = useState(0);
    const [validImages, setValidImages] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pre-validate all images
    useEffect(() => {
      const validateImages = async () => {
        setIsLoading(true);
        const validImageIndexes: number[] = [];

        // Create promises to check each image
        const imagePromises = Array.from({ length: count }, (_, i) => {
          return new Promise<number | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(i);
            img.onerror = () => resolve(null);
            img.src = `${prefix}${i + 1}${suffix}`;
          });
        });

        // Wait for all images to be checked
        const results = await Promise.all(imagePromises);

        // Filter out null values (broken images)
        results.forEach((result) => {
          if (result !== null) {
            validImageIndexes.push(result);
          }
        });

        setValidImages(validImageIndexes);
        setIsLoading(false);
      };

      validateImages();
    }, [prefix, suffix, count]);

    const goPrev = () => {
      // Navigate to the previous image
      setCurrentValidIndex(
        (prev) => (prev === 0 ? validImages.length - 1 : prev - 1) // if at the first image, wrap around to the last valid image
      );
    };

    const goNext = () => {
      // Navigate to the next image
      setCurrentValidIndex(
        (prev) => (prev === validImages.length - 1 ? 0 : prev + 1) // if at the last image, wrap around to the first valid image
      );
    };

    // Show loading state
    if (isLoading) {
      return (
        <div className="hotel-gallery-carousel">
          <div className="carousel-image-placeholder">
            <p>Loading images...</p>
          </div>
        </div>
      );
    }

    // If no valid images found
    if (validImages.length === 0) {
      return (
        <div className="hotel-gallery-carousel">
          <div className="carousel-image-placeholder">
            <p>Images not available</p>
          </div>
        </div>
      );
    }

    const currentImageIndex = validImages[currentValidIndex];

    return (
      <div className="hotel-gallery-carousel">
        <button className="carousel-btn left" onClick={goPrev}>
          <span className="arrow-symbol">‹</span>
        </button>
        <img
          className="carousel-image"
          src={`${prefix}${currentImageIndex + 1}${suffix}`}
          alt={`Hotel image ${currentValidIndex + 1} of ${validImages.length}`}
        />
        <button className="carousel-btn right" onClick={goNext}>
          <span className="arrow-symbol">›</span>
        </button>

        <div className="image-counter">
          {currentValidIndex + 1}/{validImages.length}
        </div>
      </div>
    );
  }

  //const query = new URLSearchParams(window.location.search);
  //const { hotelId } = useParams();
  const location = useLocation();
  const { searchParams } = location.state || {};

  const { destinationId, checkin, checkout, guests, adults, children } =
    searchParams ?? {};

  console.log(searchParams);

  /*const destinationId = query.get("destination_id") || "WD0M";
  const checkin = query.get("checkin") || "2025-10-11";
  const checkout = query.get("checkout") || "2025-10-17";
  const guests = query.get("guests") || "2";*/

  console.log("hotel data: ", hotel);
  console.log("rooms data: ", rooms);
  console.log("params data: " + JSON.stringify(location.state));

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const [hotelRes, priceRes] = await Promise.all([
          fetchHotelDetails(id!),
          fetchHotelRoomPrices(
            id!,
            destinationId!,
            checkin!,
            checkout!,
            guests!
          ),
        ]);
        setHotel(hotelRes);
        setRooms(priceRes.rooms || []);
        //If got no avaiable rooms, redirect to previous page
      } catch (err: any) {
        setError("Failed to load hotel details, try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetails();
  }, [id]);

  // Function to parse hotel description into sections
  const parseHotelDescription = (description: string) => {
    if (!description) return {};

    const sections: { [key: string]: string } = {};

    // Define the patterns for each section
    const patterns = {
      dining: "Enjoy a satisfying meal",
      businessAmenities: "Featured amenities",
      rooms: "Make yourself at home",
      attractions: "Distances are displayed",
      location: "With a stay",
      headline: "In Singapore",
    };

    // Split description
    const text = description.replace(/\n/g, " ").trim();

    const matches: { type: string; start: number; pattern: string }[] = [];

    Object.entries(patterns).forEach(([type, pattern]) => {
      const index = text.indexOf(pattern);
      if (index !== -1) {
        matches.push({ type, start: index, pattern });
      }
    });

    // Sort matches
    matches.sort((a, b) => a.start - b.start);

    // Extract sections
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];

      const startIndex = current.start;
      const endIndex = next ? next.start : text.length;

      sections[current.type] = text.substring(startIndex, endIndex).trim();
    }

    if (matches.length > 0) {
      const firstMatch = matches[0];
      const amenitiesText = text.substring(0, firstMatch.start).trim();
      if (amenitiesText) {
        sections.amenities = amenitiesText;
      }
    } else {
      // no patterns found
      sections.amenities = text;
    }

    return sections;
  };

  // clean and format attractions HTML
  const formatAttractionsContent = (content: string) => {
    // Remove HTML tags
    const cleanContent = content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    // Split into lines and filter out empty ones
    const lines = cleanContent.split("\n").filter((line) => line.trim());

    return lines.map((line, index) => (
      <div
        key={index}
        style={{ marginBottom: "8px", color: "#666", fontSize: "15px" }}
      >
        {line.trim()}
      </div>
    ));
  };

  const scrollToRoomOptions = () => {
    const roomOptionsSection = document.getElementById("room-options");
    if (roomOptionsSection) {
      roomOptionsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToLocation = () => {
    const locationSection = document.getElementById("location-section");
    if (locationSection) {
      locationSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const parsedSections = parseHotelDescription(hotel?.description || "");

  const handleSelect = (room: any) => {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = calculateNights(checkinDate, checkoutDate);
    const formattedRate = Number((room.converted_price || room.price || 0)/nights).toFixed(2);
    const formattedPrice = Number(room.converted_price || room.price || 0).toFixed(2);
    const noRooms = guests && guests.includes("|") ? guests.split("|").length : 1;
    navigate("/checkhoteldetailspage", {
      state: {
        id: id,
        destId: destinationId,
        hotelName: hotel?.name || "Unknown Hotel",
        hotelAddress: hotel?.address || "Unknown Address",
        key: room.key,
        rates: formattedRate,
        price: formattedPrice,
        checkin: checkinDate,
        checkout: checkoutDate,
        noAdults: adults,
        noChildren: children || 0,
        roomType:
          room?.roomDescription ||
          room?.roomNormalizedDescription ||
          "Standard Room",
        noRooms: noRooms,
        roomImage: room?.images?.[0]?.url || "",
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!hotel) return <div>No hotel found.</div>;

  return (
    <div className="hotel-info-page">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hotel Header */}
      <div className="hotel-header">
        <h1>{hotel.name}</h1>
        <div className="hotel-address-container">
          <p className="hotel-address">{hotel.address}</p>
          <button className="location-btn" onClick={scrollToLocation}>
            View on Map
          </button>
        </div>
        <span className="star-rating">Rating: {hotel.rating} / 5</span>
      </div>

      {/* Main Content Layout */}
      <div className="main-content-layout">
        {/* Left Content */}
        <div className="left-content">
          {/* Hotel Gallery */}
          {hotel?.image_details && (
            <ImageCarousel
              prefix={hotel.image_details.prefix}
              suffix={hotel.image_details.suffix}
              count={hotel.image_details.count}
            />
          )}

          {/* Hotel Details */}
          <div className="hotel-details">
            {/* Hotel Overview */}
            <section className="hotel-overview">
              <h2>Hotel overview</h2>

              {/* Amenities Section */}
              {(parsedSections.amenities ||
                (hotel.amenities &&
                  Object.keys(hotel.amenities).length > 0)) && (
                <div className="overview-section">
                  <h3>Amenities</h3>
                  {parsedSections.amenities && (
                    <p>{parsedSections.amenities}</p>
                  )}
                </div>
              )}

              {/* Dining Section */}
              {parsedSections.dining && (
                <div className="overview-section">
                  <h3>Dining</h3>
                  <p>{parsedSections.dining}</p>
                </div>
              )}

              {/* Business Amenities Section */}
              {parsedSections.businessAmenities && (
                <div className="overview-section">
                  <h3>Business Amenities</h3>
                  <p>{parsedSections.businessAmenities}</p>
                </div>
              )}

              {/* Rooms Section */}
              {parsedSections.rooms && (
                <div className="overview-section">
                  <h3>Rooms</h3>
                  <p>{parsedSections.rooms}</p>
                </div>
              )}

              {/* Attractions Section */}
              {parsedSections.attractions && (
                <div className="overview-section">
                  <h3>Attractions</h3>
                  <div className="attractions-content">
                    {formatAttractionsContent(parsedSections.attractions)}
                  </div>
                </div>
              )}

              {/* Location Section */}
              {parsedSections.location && (
                <div className="overview-section">
                  <h3>Location</h3>
                  <p>{parsedSections.location}</p>
                </div>
              )}

              {/* Headline Section */}
              {parsedSections.headline && (
                <div className="overview-section">
                  <h3>Headline</h3>
                  <p>{parsedSections.headline}</p>
                </div>
              )}
            </section>

            {/* ROOM OPTIONS */}
            <section id="room-options" className="room-options">
              <h2>Room Options</h2>
              {rooms.length === 0 ? (
                <p className="no-rooms-text">
                  No available rooms found for your selected dates.
                </p>
              ) : (
                <div className="rooms-container">
                  {(() => {
                    const grouped: { [key: string]: any[] } = {};
                    rooms.forEach((room: any) => {
                      const roomType = room.type || "default";
                      if (!grouped[roomType]) {
                        grouped[roomType] = [];
                      }
                      grouped[roomType].push(room);
                    });

                    return Object.entries(grouped).map(
                      ([roomType, roomList]: [string, any[]]) => {
                        const roomTitle =
                          roomList[0]?.roomDescription ||
                          roomList[0]?.roomNormalizedDescription ||
                          "Room";

                        const sortedRooms = roomList.sort(
                          (a: any, b: any) =>
                            (a.converted_price || a.price || 0) -
                            (b.converted_price || b.price || 0)
                        );

                        return (
                          <div key={roomType} className="room-type-section">
                            <div className="room-type-header">{roomTitle}</div>

                            <div className="room-type-content">
                              <div className="room-type-image">
                                {sortedRooms[0]?.images &&
                                sortedRooms[0].images.length > 0 ? (
                                  <img
                                    src={sortedRooms[0].images[0].url}
                                    alt="Room"
                                    className="room-type-thumbnail"
                                  />
                                ) : (
                                  <div className="room-type-placeholder">
                                    <span>No Image Available</span>
                                  </div>
                                )}
                              </div>

                              <div className="room-options-list">
                                {sortedRooms.map((room: any) => {
                                  const isBreakfast =
                                    room.roomAdditionalInfo?.breakfastInfo ===
                                    "hotel_detail_breakfast_included";
                                  const serviceType = isBreakfast
                                    ? "Breakfast Included"
                                    : "Room Only";
                                  const isCancellable = room.free_cancellation;

                                  return (
                                    <div
                                      key={room.key}
                                      className="room-option-item"
                                    >
                                      <div className="room-option-details">
                                        <div className="service-row">
                                          <span className="service-label">
                                            {serviceType}
                                          </span>
                                        </div>

                                        <div className="cancellation-row">
                                          {isCancellable ? (
                                            <>
                                              <span className="cancellation-free">
                                                Free cancellation (except a
                                                service fee, if applicable)
                                              </span>
                                            </>
                                          ) : (
                                            <span className="cancellation-non-refundable">
                                              Non-refundable
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="room-option-price">
                                        <div className="price-info">
                                          <div className="room-price">
                                            SGD{" "}
                                            {room.converted_price ||
                                              room.price ||
                                              0}
                                          </div>
                                          <div className="room-duration">
                                            1 room • 1 night
                                          </div>
                                        </div>
                                        <button
                                          className="select-button"
                                          onClick={() => handleSelect(room)}
                                        >
                                          Select
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>
              )}
            </section>

            {/* Location Section */}
            <section id="location-section" className="location-section">
              <h2>Location</h2>
              <div className="map-container">
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
            </section>

            <div className="bottom-spacer"></div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar">
          {/* Price Display */}
          <div className="price-display">
            <span className="from-text">Select rooms starting from:</span>
            <span className="price-large">
              SGD{" "}
              {rooms.length > 0
                ? Math.min(
                    ...rooms.map((r) => r.converted_price || r.price || 0)
                  )
                : "432"}
            </span>
            <span className="duration-text">1 Room 1 Night</span>
          </div>
          <button className="see-rooms-btn" onClick={scrollToRoomOptions}>
            See Room Options
          </button>

          {/* Facilities */}
          <div className="facilities">
            <h3>Facilities</h3>
            <div className="facility-list">
              {hotel.amenities &&
                Object.entries(hotel.amenities)
                  .filter(([key, value]) => value === true)
                  .slice(0, 12)
                  .map(([amenityKey, _], index) => {
                    const amenityName = amenityKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={index} className="facility-item">
                        <span>✓</span>
                        {amenityName}
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
