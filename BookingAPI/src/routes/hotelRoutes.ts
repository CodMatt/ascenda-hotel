import express from 'express';
import { validateSearchParams } from '@src/common/util/validators';

const router = express.Router();
const BASE_URL = 'https://hotelapi.loyalty.dev/api';

/**
 * Get Hotel prices
 */
router.get('/prices',validateSearchParams,async (req:any, res:any) => {
  const { destination_id, checkin, checkout, guests } = req.body;// taking from body instead of params
  
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
  const { destination_id } = req.body;
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
router.get('/:id/price',validateSearchParams ,async (req:any, res:any) => {
  const { id } = req.params;
  const { destination_id, checkin, checkout, guests } = req.body;

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