import express from 'express';
import cors from 'cors';
import hotelsRouter from './routes/hotels';
import mongoose from 'mongoose';
import destRouter from './routes/dest';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 4000;


console.log("Mongo URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI!)
.then(() => console.log('Connected to MongoDB atlas'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.use('/api/hotels', hotelsRouter);
app.use('/api/destinations', destRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
