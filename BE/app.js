import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './src/config/db.js'; 
import userRoute from './src/routes/userRoute.js';
import eventRoute from './src/routes/eventRoute.js'
import contestantRoute from './src/routes/contestantRoute.js'
import judgeRoute from './src/routes/judgeRoute.js'
import roundRoute from './src/routes/roundRoute.js'
import scoreRoute from './src/routes/scoreRoute.js'
import titleRoute from './src/routes/titleRoute.js'
import titleAssignmentRoute from './src/routes/titleAssignmentRoute.js'; 

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use('/api/v1/users', userRoute); 
app.use('/api/v1/events', eventRoute)
app.use('/api/v1/contestants', contestantRoute)
app.use('/api/v1/judges', judgeRoute)
app.use('/api/v1/rounds', roundRoute)
app.use('/api/v1/scores',scoreRoute)
app.use('/api/v1/titles',titleRoute)
app.use('/api/v1/titleassignment',titleAssignmentRoute)

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});