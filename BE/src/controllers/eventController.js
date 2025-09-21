import Event from '../models/eventModel.js'
import { configDotenv } from 'dotenv';

// Create Event
export const createEvent = async (req, res) => {
    try {
      const { name, image, created_by  } = req.body;

      const event = new Event({ name, image, created_by})
      await event.save();

      const{id, createdAt} = event

      res.status(201).json({ message: "Event registered successfully", event: {id,name,created_by,createdAt}});

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Get Event
export const getEvent = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json({ events });

    } catch (err) {
    res.status(500).json({ error: err.message });
  }

}

//Get Single Event
export const getSingleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Fetched data by id", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit Event
export const editEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, image, created_by } = req.body;

    const updatedEvent= await Event.findByIdAndUpdate(
      id,
      { name, image, created_by},
      { new: true}
    );

    if(!updatedEvent){
      return res.status(404).json({message:"Event not found"});
    }

    res.status(200).json({message:"Event updated successfully", event: updatedEvent})
    
  } catch (err) {
    res.status(500).json({error: err.message})
  }

}

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

      const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



