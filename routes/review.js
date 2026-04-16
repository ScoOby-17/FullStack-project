const express = require("express")
const router = express.Router({mergeParams : true})
const Listing = require("../models/listing");
const Reviews = require("../models/review.js");
const wrapAsync = require("../utilities/wrapAsync");
const ExpressError = require("../utilities/ExpressError");
const { reviewSchema } = require("../Schema.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Add review Post request
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let { comment, rating } = req.body;

    let listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const review = new Reviews({
      comment: comment,
      rating: rating,
    });

    listing.reviews.push(review._id);

    await review.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
  }),
);

//delete a review
router.delete("/:reviewId" , async(req,res)=>{
  let {id , reviewId} = req.params
  let listing = await Listing.findByIdAndUpdate(id , {$pull : {reviews: reviewId}})
  await Reviews.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
})

module.exports = router