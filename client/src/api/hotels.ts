// Fetches list of avail hotels for given parameters from backend
const HOTEL_API = 'http://localhost:6039/api/Hotels';

export async function fetchHotels(
  destinationId: string,
  checkin: string,
  checkout: string,
  guests: string
) {

  // Constructed URL (sending req to backend which already merge hotel info + price)
  const url = `${HOTEL_API}/search?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  
  // Req to backend 
  const res = await fetch(url);

  // If server returns anyth else, ERROR. 
  if (!res.ok) throw new Error("Failed to fetch merged hotel data");

  return res.json(); // returns: { hotels: [...], completed, destination_id, etc. }
}

export async function fetchHotelDetails(hotelId: string) {
  const url = `${HOTEL_API}/${hotelId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch hotel details");
  return res.json();
}

export async function fetchHotelRoomPrices(hotelId: string, destinationId: string, checkin: string, checkout: string, guests: string) {
  console.log("hotels.ts: ",destinationId + checkin + checkout + guests)
  const url = `${HOTEL_API}/${hotelId}/price?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch hotel room prices");
  return res.json();
}
