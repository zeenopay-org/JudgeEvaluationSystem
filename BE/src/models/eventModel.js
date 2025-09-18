import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    image:{
        type : String,
        required : true
    },
    created_by : {
        type : String,
        required : true
    },
    created_at : {
        type : Date,
        required : true,
        default : Date.now()
    }  
},
{timestamps:true})

export default mongoose.model('Events' , eventSchema);


