import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
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
import uploadRoute from './src/routes/uploadRoute.js';
import http from "http";
import { initSocket } from './src/utils/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin:[ 'http://localhost:5173', 'https://judgeevaluation.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials:true

}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Hello from Render!I am live now');
});

app.use('/api/v1/users', userRoute); 
app.use('/api/v1/events', eventRoute)
app.use('/api/v1/contestants', contestantRoute)
app.use('/api/v1/judges', judgeRoute)
app.use('/api/v1/rounds', roundRoute)
app.use('/api/v1/scores',scoreRoute)
app.use('/api/v1/titles',titleRoute)
app.use('/api/v1/titleassignment',titleAssignmentRoute)
app.use('/api/v1', uploadRoute);

initSocket(server);

const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});


