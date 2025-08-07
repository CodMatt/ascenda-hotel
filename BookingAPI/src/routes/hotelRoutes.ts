import express, {Request, Response} from 'express';
import { validateSearchParams } from '@src/common/util/validators';
import { fetchWithRetry } from '@src/common/util/misc';

const router = express.Router();
const BASE_URL = 'https://hotelapi.loyalty.dev/api';

router.get("/search", async (req: Request, res: Response): Promise<void> => {
  console.log("GET /search triggered");

  // Extract and validate query parameters
  const {
    destination_id,
    checkin,
    checkout,
    lang = "en_US",
    currency = "SGD",
    country_code = "SG",
    guests,
    partner_id = "1089",
  } = req.query;

  if (!destination_id || !checkin || !checkout || !guests) {
    res.status(400).json({ error: "Missing required query parameters." });
    return;
  }

  try {

    // Build URLs for price and hotel info endpoints
    const priceUrl = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
    const detailsUrl = `https://hotelapi.loyalty.dev/api/hotels?destination_id=${destination_id}`;


    // Fetch hotel price and availability data with retries
    const priceData = await fetchWithRetry(priceUrl); 

    // Fetch static hotel info (name, address, image, etc.)
    const hotelResponse = await fetch(detailsUrl);
    if (!hotelResponse.ok) {
      const errorText = await hotelResponse.text();
      console.error("Hotel details fetch failed:", errorText);
      res.status(hotelResponse.status).json({ error: "Unable to retrieve hotel details." });
      return;
    }

    const hotelDetails= await hotelResponse.json();

    // Map hotel static data by ID for easy merging
    const hotelMap = new Map();
    for (const hotel of hotelDetails) {
      hotelMap.set(hotel.id, hotel);
    }

    // Combine price and static info into a unified hotel object
    const mergedHotels = priceData.hotels.map((hotel: any) => {
      const details = hotelMap.get(hotel.id);
      return {
        id: hotel.id,
        name: details?.name ?? null,
        address: details?.address ?? null,
        rating: details?.rating ?? null,
        latitude: details?.latitude ?? null,
        longitude: details?.longitude ?? null,
        image: details?.image_details?.prefix
          ? `${details.image_details.prefix}0${details.image_details.suffix}`
          : null,
        price: hotel.price,
        free_cancellation: hotel.free_cancellation,
        rooms_available: hotel.rooms_available,
        trustyou: details?.trustyou?.score ?? null,
        amenities: details?.amenities ?? null,
        market_rates: hotel.market_rates ?? [],
      };
    });

    console.log(`Merged result - Returning ${mergedHotels.length} hotels`);

    // Send merged hotel data as JSON response
    res.json({
      completed: true,
      destination_id,
      checkin,
      checkout,
      guests,
      currency,
      hotels: mergedHotels,
    });
  } catch (error) {
    console.error("Unhandled server error during hotel search:", error);
    res.status(500).json({ error: "Internal server error during hotel search." });
  }
});

/**
 * Get Hotel prices
 */
router.get('/prices',async (req:any, res:any) => {
  const { destination_id, checkin, checkout, guests } = req.query;// taking from body instead of params
  
  try {
    console.log("Calling Loyalty API with URL:", `${BASE_URL}/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}&partner_id=1089`);
    const response = await fetch(`${BASE_URL}/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotel prices', details: err });
  }
});

// get destination
/**
 * Get hotels based on destination id
 */
router.get('/', async (req, res) => {
  const { destination_id } = req.query;
  if (!destination_id) {
    return res.status(400).json({ error: 'Missing destination_id' });
  }

  try {
    const response = await fetch(`${BASE_URL}/hotels?destination_id=${destination_id}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotel list', details: err });
  }
});


/**
 * get static detail for hotel
 */ 
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const url = `${BASE_URL}/hotels/${id}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotel details', details: err });
  }
});

/**
 * Get prices for specific hotel
 */
router.get('/:id/price' ,async (req:any, res:any) => {
  const { id } = req.params;
  const { destination_id, checkin, checkout, guests } = req.query;

  const url = `${BASE_URL}/hotels/${id}/price?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}&lang=en_US&currency=SGD&country_code=SG&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotel room prices', details: err });
  }
});

export default router;