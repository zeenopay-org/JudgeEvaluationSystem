import Event from '../models/eventModel.js'
import { configDotenv } from 'dotenv';


export const createEvent = async (req, res) => {
    try {
      const { name,image, created_by  } = req.body;

      const event = new Event({ name, image, created_by})
      await event.save();

      const{id, created_at} = event

      res.status(201).json({ message: "event registered successfully", event: {id,name,created_by,created_at}});

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };