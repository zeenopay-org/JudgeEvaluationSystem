import Round from "../models/roundModel.js";
import configDotenv from "dotenv";
import jwt from "jsonwebtoken";

export const createRound = async (req, res) => {
    try {
        const {name, type, max_score, questions, eventId} = req.body;
        // Normalize questions to array of objects
        let normalizedQuestions = [];
        if (Array.isArray(questions)) {
            normalizedQuestions = questions
                .filter(q => q)
                .map(q => (typeof q === 'string' ? { question_text: q } : q));
        } else if (typeof questions === 'string' && questions.trim() !== '') {
            normalizedQuestions = [{ question_text: questions.trim() }];
        }

        const round = new Round({name, type, max_score, questions: normalizedQuestions, event: eventId });
        const {id} = round;
        await round.save();
        res.status(201).json({message: "Round created successfully", round: {id,name,type,max_score,questions,eventId}});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


export const getRounds = async (req, res) => {
    try {
        const rounds = await Round.find().populate('event');
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

export const editRound = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, type, max_score, questions, eventId} = req.body;
        let normalizedQuestions = undefined;
        if (typeof questions !== 'undefined') {
            normalizedQuestions = Array.isArray(questions)
                ? questions.filter(q => q).map(q => (typeof q === 'string' ? { question_text: q } : q))
                : (typeof questions === 'string' && questions.trim() !== '' ? [{ question_text: questions.trim() }] : []);
        }
        const update = { name, type, max_score, event: eventId };
        if (typeof normalizedQuestions !== 'undefined') update.questions = normalizedQuestions;
        const round = await Round.findByIdAndUpdate(id, update, { new: true });
        res.status(200).json(round);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const deleteRound = async (req, res) => {
    try {
        const {id} = req.params;
        const round = await Round.findByIdAndDelete(id);
        res.status(200).json(round);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

