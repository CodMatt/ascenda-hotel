//TODO: for mongodb query, BUTTTTT i need to work on the autocorrect
import express from 'express';
import mongoose from 'mongoose';

// Define the Destination schema and model
const Destination = mongoose.model('destinations', new mongoose.Schema({
  uid: String,
  term: String,
  state: String,
  country: String,
}));

const router = express.Router();

router.get('/', async (req, res) => {
  const { search = "" } = req.query;

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).json({ error: "Search query cannot be empty" });
  }

  try {
    const results = await Destination.aggregate([
      {
        $search: {
          index: "destinationsearch",
          autocomplete: {
            query: search,
            path: "term",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0,
              maxExpansions: 50
            }
          }
        }
      },
      { $limit: 10 }
    ]);

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error performing search");
  }
});

export default router;