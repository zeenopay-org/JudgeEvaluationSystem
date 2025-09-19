import Contestant from '../models/contestantsModel.js'
import { configDotenv } from 'dotenv'

//create contestants 
export const createContestant = async ( req , res ) => {

    try {
        
        const {name, contestant_number} = req.body

        const contestant = new Contestant ({ name , contestant_number });
        await contestant.save();

        const {id} = contestant;

        res.status(201).json({"message" : "contestant created successfully" , contestant : {id,name,contestant_number}})

    } catch (err) {
        res.status(500).json({error: err.message})
        
    }
}

//get contestants

//delete contestatnts

///edit contestants 
