const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// listing ke andr hum location ka data store krenge
const ListingSchema = new Schema({
    title :{
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        }
    },
    price : {
        type : String,
        required : true
    },
    location : {
        type : String,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    reviews :[
        {
          type : Schema.Types.ObjectId,
          ref : "Review"
        }
    ]
});

const Review = require("./review"); // import review model

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews } // delete all related reviews
    });
  }
});

const Listing = mongoose.model("Listing",ListingSchema);
module.exports = Listing;