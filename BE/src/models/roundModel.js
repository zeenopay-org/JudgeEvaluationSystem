import mongoose from "mongoose"

const roundSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true,
        enum : ['normal' , 'qna']
    },
    max_score : {
        type : Number,
        required : true
    },
    event : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Events',
        required : true
    },
})
export default mongoose.model('Rounds', roundSchema)