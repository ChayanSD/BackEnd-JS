import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


const videoSchema = new Schema({
    videoFile : {
        type : String, //cloud-nary
        required : true
    },
    thumbnail : {
        type : String,
        required : true
    },

    title : {
        type : String,
        required: true,
    },
    description : {
        type : String,
        required : true
    },
    duration : {
        type : Number, //video duration information come from cloud-nary
        required : true,
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default: true
    },
    owner :[
        {
            type :Schema.Types.ObjectId,
            ref : 'User'
        }
    ] ,

}, {timestamps: true});

//aggregate paginate
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model('Video', videoSchema);