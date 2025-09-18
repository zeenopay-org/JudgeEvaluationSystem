import mongoose, { Mongoose } from "mongoose"

const judgeSchema = new mongoose.Schema({
// id : {
//     type : Number,
//     require : true
// },
name : {
    type : String,
    required : true
},
user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Users',
    required : true
},
event : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Events",
    required : true
}
})

export default mongoose.model('Judges',judgeSchema);
