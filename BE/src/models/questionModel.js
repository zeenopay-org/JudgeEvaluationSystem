import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
    // id : {
    //     type : Number,
    //     required : true
    // },
    question_text : {
        type : String,
        required : true
    },
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Events',
        required : true
    }
})

export default mongoose.model('Questions', questionSchema)
