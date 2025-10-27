import Title from "../models/titleModel.js";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

export const createTitle = async (req, res) => {
  try {
    const { name, eventId, image } = req.body;
     if (!name || !eventId) {
      return res.status(400).json({ message: 'Name and event ID are required.' });
    }

    const title = new Title({
      name,image,
      event: eventId,
    });
    const { id } = title;
    await title.save();
    res
      .status(201)
      .json({
        message: "Title created Successfylly",
        title: { id, name,image, eventId },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTitles = async (req,res) =>{
  try {
    const titles = await Title.find().populate("event");
    res.status(200).json({titles})
    
  } catch (err) {
    res.status(500).json({err: err.message })
  }
}

export const deleteTitle = async (req, res) =>{
  try {
    const {id} = req.params;
    const title = await Title.findByIdAndDelete(id);
    res.status(200).json({ message: "title deleted successfully" });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}