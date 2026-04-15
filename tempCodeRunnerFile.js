//delete a review
app.delete("/listings/:id/reviews/:reviewId" , async(req,res)=>{
  let {id , reviewId} = req.params
  let listing = await Listing.findByIdAndUpdate(id , {$pull : {reviews: reviewId}})
  await Reviews.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
})