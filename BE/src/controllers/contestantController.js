import Contestant from "../models/contestantsModel.js";
import { configDotenv } from "dotenv";
import { uploadToS3 } from "../utils/s3Uploader.js";
import XLSX from "xlsx";

//create contestants
export const createContestant = async (req, res) => {
  try {
    const { name, contestant_number, image, eventId } = req.body;
    const file = req.file;

    if (!name || !contestant_number || !eventId) {
      return res.status(400).json({ error: "All fields (name, contestant_number, eventId) are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if(name.length<5){
      return res.status(400).json({error: "Name must be at least 5 characters long"} )
    }
    if (/\d/.test(name)) {
      return res.status(400).json({ error: "Name must not contain numbers" });
    }

    const imageUrl = await uploadToS3(file);
    const existing = await Contestant.findOne({
      contestant_number,
      event: eventId,
    });

    if (existing) {
      return res.status(400).json({
        error: "Contestant number already exists for this event",
      });
    }

    const contestant = new Contestant({
      name,
      contestant_number,
      image: imageUrl,
      event: eventId,
    });
    await contestant.save();

    const { id } = contestant;

    res.status(201).json({
      message: "contestant created successfully",
      contestant: { id, name, contestant_number, image: imageUrl, eventId },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get contestants
export const getContestant = async (req, res) => {
  try {
    const contestants = await Contestant.find({}).populate("event", "name");
    res.status(200).json({ contestants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//getSingleContestant
export const getSingleContestant = async (req, res) => {
  try {
    const { id } = req.params;
    const contestant = await Contestant.findById(id);

    if (!contestant) {
      return res.status(404).json({ message: " Contestant not found" });
    }
    res.status(200).json({ message: "Fetched data by id", contestant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

///edit contestants
export const editContestant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contestant_number, eventId } = req.body;
    const file = req.file;

    //  check if contestant exists
    const existingContestant = await Contestant.findById(id);
    if (!existingContestant) {
      return res.status(404).json({ error: "Contestant not found" });
    }

    //  prevent duplicate contestant_number in same event
    const duplicate = await Contestant.findOne({
      contestant_number,
      event: eventId,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ error: "Contestant number already exists for this event" });
    }

    //  upload new image if provided
    let imageUrl = existingContestant.image; // keep old image if no new file
    if (file) {
      imageUrl = await uploadToS3(file);
    }

    // Step 4: update contestant
    const updatedContestant = await Contestant.findByIdAndUpdate(
      id,
      {
        name,
        contestant_number,
        image: imageUrl,
        event: eventId,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Contestant edited successfully",
      contestant: updatedContestant,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

//delete contestatnts
export const deleteContestants = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContestant = await Contestant.findByIdAndDelete(id);

    if (!deletedContestant) {
      return res.status(404).json({ message: "contestant not found" });
    }
    return res.status(200).json({ message: "Contestant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get contestant for events
export const getEventContestants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const contestants = await Contestant.find({ event: eventId }).populate(
      "event",
      "name"
    );
    res.status(200).json({ contestants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUploadContestants = async (req, res) => {
  try {
    const { eventId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheet.length) {
      return res.status(400).json({ error: "Excel SHeet is empty" });
    }

    const missingFields = [];
    const contestantsToInsert = [];

    for (const row of sheet) {
      const { name, contestant_number, image } = row;

      if (!name || !contestant_number || !image) {
        missingFields.push(row);
        continue;
      }

      //check for duplicates within the same event
      const existing = await Contestant.findOne({
        contestant_number,
        event: eventId,
      });

      if (existing) continue; //skip duplicates

      contestantsToInsert.push({
        name,
        contestant_number,
        image,
        event: eventId,
      });
    }
    if (contestantsToInsert.length > 0) {
      await Contestant.insertMany(contestantsToInsert);
    }

    res.status(201).json({
      message: "Bulk upload Completed",
      inserted: contestantsToInsert.length,
      skipped: sheet.length - contestantsToInsert.length,
      missingFields,
    });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};
