import mongoose, { Mongoose } from "mongoose"

const judgeSchema = new mongoose.Schema({
contact : {
    type : String,
    required : true
},
user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Users',
    required : true
},
event : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Events",
    required : true
}]
},
{timestamps:true}
)

export default mongoose.model('Judges',judgeSchema);
