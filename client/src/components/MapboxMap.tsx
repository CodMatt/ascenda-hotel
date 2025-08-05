import { useEffect, useRef, useState } from "react";

// Types for coordinates and hotel data
type Coordinates = {
  lng: number;
  lat: number;
};

type Hotel = {
  id: string; 
  name: string;
  address: string;
  coordinates: Coordinates;
};

// Props for the MapboxMap component
type MapboxMapProps = {
  hotels: Hotel[]; // hotel array with lat/lng 
  onHotelSelect: (hotelName: string) => void; // called when Marker's "Select" button si clicked
};

const MapboxMap: React.FC<MapboxMapProps> = ({ hotels, onHotelSelect }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null); // for map rendering
  const map = useRef<any>(null); // map instance
  const [zoom] = useState<number>(13); // initial zoom 
  const [mapLoaded, setMapLoaded] = useState(false); // track map loading 
  const [error, setError] = useState<string | null>(null); // error states
  const [loading, setLoading] = useState(true); // loading states 

  useEffect(() => {
    if (!hotels || hotels.length === 0) return;


    // Load Mapbox GL JS if not already loade
    const loadMapbox = async () => {
      try {
        if ((window as any).mapboxgl) {
          initializeMap((window as any).mapboxgl);
          return;
        }

        // Inject Mapbox script
        const script = document.createElement("script");
        script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
        script.onload = () => {
          const link = document.createElement("link");
          link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
          link.rel = "stylesheet";
          document.head.appendChild(link);

          // Set the access token and initialize map
          (window as any).mapboxgl.accessToken =
            "pk.eyJ1IjoibHRyZWV6IiwiYSI6ImNtZGRhbGNoZDAybHIyaW9zaHRlNnh1ZHEifQ.xABP_P9k-XU_TA55waqVNQ";

          initializeMap((window as any).mapboxgl);
        };
        script.onerror = () => {
          setError("Failed to load Mapbox GL JS");
          setLoading(false);
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error("Error loading Mapbox:", err);
        setError("Failed to initialize map");
        setLoading(false);
      }
    };

    // Create HTML content for a marker popup
    const createPopup = (hotel: Hotel): HTMLElement => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>${hotel.name}</h3><p>${hotel.address}</p>`;

      const button = document.createElement("button");
      button.innerText = "Select";
      button.style.marginTop = "8px";
      button.style.padding = "6px 10px";
      button.style.cursor = "pointer";
      button.style.background = "#FF5323";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "4px";

      button.onclick = () => onHotelSelect(hotel.id);
      div.appendChild(button);

      return div;
    };

    // Initialize the Mapbox map and add hotel markers
    const initializeMap = (mapboxgl: any) => {
      if (map.current) return;

      const center = hotels[0].coordinates;

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [center.lng, center.lat],
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      hotels.forEach((hotel) => {
        const { lng, lat } = hotel.coordinates;

        new mapboxgl.Marker({ color: "#FF5323" })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setDOMContent(createPopup(hotel))
          )
          .addTo(map.current);
      });

      map.current.on("load", () => {
        setMapLoaded(true);
        setLoading(false);
      });
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [hotels, zoom, onHotelSelect]);


  // Render error fallback if map fails
  if (error) {
    return (
      <div
        style={{
          height: 300,
          backgroundColor: "#fee",
          padding: "20px",
          borderRadius: "8px",
          color: "#c33",
        }}
      >
        <strong>Map error:</strong> {error}
      </div>
    );
  }

  // Render the map container and loading overlay
  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {(loading || !mapLoaded) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
            fontSize: "16px",
            color: "#666",
          }}
        >
          Loading map...
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
