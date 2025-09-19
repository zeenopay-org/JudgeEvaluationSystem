import mongoose from "mongoose"

const contestantSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    contestant_number : {
        type : Number,
        required : true,
        unique : true
    },
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Events",
        required : true
    }
  },
{timestamps:true}
)

export default mongoose.model('Contestants',contestantSchema)
