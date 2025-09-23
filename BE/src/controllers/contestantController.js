import Contestant from '../models/contestantsModel.js'
import { configDotenv } from 'dotenv'

//create contestants 
export const createContestant = async ( req , res ) => {

    try {
        
        const {name, contestant_number,eventId} = req.body

        const contestant = new Contestant ({ name , contestant_number , event: eventId});
        await contestant.save();

        const {id} = contestant;

        res.status(201).json({"message" : "contestant created successfully" , contestant : {id,name,contestant_number,eventId}})

    } catch (err) {
        res.status(500).json({error: err.message})
        
    }
}

//get contestants
export const getContestant = async (req , res) =>{
    try {
        const contestants = await Contestant.find({}).populate('event', 'name');
        res.status(200).json({contestants});
        
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

//getSingleContestant
export const getSingleContestant = async (req,res) => {
    try {
        const {id}= req.params;
        const contestant = await Contestant.findById(id);

        if(!contestant){
            return res.status(404).json({message:" Contestant not found"});
        }
        res.status(200).json({message:"Fetched data by id", contestant});
        
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

///edit contestants 
export const editContestant = async (req,res) =>{
    try {
        const {id}= req.params;
        const{name,contestant_number,eventId}= req.body;

        const updatedContestant = await Contestant.findByIdAndUpdate(
            id,
            {name,contestant_number,eventId},
            {new:true}
        )
        if(!updatedContestant){
            res.status(404).json({message:"contestant not found"})
        }
        res.status(200).json({message:'contestant edited successfully'})

    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

//delete contestatnts
export const deleteContestants = async (req,res) => {
    try {
        const {id}= req.params;
        const deletedContestant = await Contestant.findByIdAndDelete(id);
    
        if(!deletedContestant){
            return res.status(404).json({message:"contestant not found"})
        }
        return res.status(200).json({message: 'Contestant deleted successfully'})
        
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};



