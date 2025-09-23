import Round from "../models/roundModel.js";
import configDotenv from "dotenv";
import jwt from "jsonwebtoken";

export const createRound = async (req, res) => {
    try {
        const {name, type, max_score, eventId} = req.body;
        const round = new Round({name, type, max_score, event: eventId });
        const {id} = round;
        await round.save();
        res.status(201).json({message: "Round created successfully", round: {id,name,type,max_score,eventId}});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


export const getRounds = async (req, res) => {
    try {
        const rounds = await Round.find();
        res.status(200).json(rounds);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getRoundById = async (req, res) => {  
    try {
        const {id} = req.params;
        const round = await Round.findById(id);
        res.status(200).json(round);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}