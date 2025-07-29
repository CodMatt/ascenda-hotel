//TODO: for mongodb query, BUTTTTT i need to work on the autocorrect
import express from 'express';
import mongoose from 'mongoose';

// Define the Destination schema and model
const Destination = mongoose.model('Destination', new mongoose.Schema({
  uid: String,
  term: String,
  state: String,
  country: String,
}));

const router = express.Router();

router.get('/', async (req, res) => {
  const { search = "" } = req.query;
  const regex = new RegExp(search as string, 'i'); // case-insensitive search

  const results = await Destination.find({
    $or: [
      { term: regex },
      { state: regex },
      { country: regex }
    ]
  }).limit(10);

  res.json(results);
});

export default router;