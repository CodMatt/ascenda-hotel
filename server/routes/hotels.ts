import express from 'express';

const router = express.Router();
const BASE_URL = 'https://hotelapi.loyalty.dev/api';

router.get('/prices', async (req, res) => {
  const { destination_id, checkin, checkout, guests } = req.query;
  console.log('/prices hit!', req.query);
  if (!destination_id || !checkin || !checkout || !guests) {
    return res.status(400).json({ error: 'Missing query params' });
  }

  try {
    const response = await fetch(`${BASE_URL}/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}&partner_id=1`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hotel prices', details: err });
  }
});

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

export default router;
