import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './src/config/db.js'; 
import userRoute from './src/routes/userRoute.js';
import eventRoute from './src/routes/eventRoute.js'
import contestantRoute from './src/routes/contestantRoute.js'

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use('/api/v1/users', userRoute); 
app.use('/api/v1/events', eventRoute)
app.use('/api/v1/contestants', contestantRoute)

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});