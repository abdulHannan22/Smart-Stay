const mongoose = require("mongoose")
const review = require("./review")
const Schema = mongoose.Schema;

const listingSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "review",

        }
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

listingSchema.post("findOneAndDelete", async (listingdata) =>{
    if(listingdata){
        await review.deleteMany({_id : {$in: listingdata.reviews }})
    }
    
})


const listing = mongoose.model("listing",listingSchema);
module.exports = listing;