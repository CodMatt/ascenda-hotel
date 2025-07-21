import express from 'express';
import cors from 'cors';
import hotelsRouter from './routes/hotels';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/hotels', hotelsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
