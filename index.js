const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const console = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utilities/wrapAsync");
const ExpressError = require("./utilities/ExpressError");
const Reviews = require("./models/review.js");
const { reviewSchema } = require("./Schema.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then((res) => {
    console.log("connected to database Wanderlust");
  })
  .catch((err) => console.log(err));

async function main() {
  const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
  await mongoose.connect(MONGO_URL);
}

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//index
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
});

//home
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//create listing
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

//create Route
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    // let {title,description,price,image,location,country} = req.body
    let { title, description, image, price, location, country } = req.body; //alternative
    const newListing = new Listing({
      title: title,
      description: description,
      image: {
        url: image,
      },
      price: price,
      location: location,
      country: country,
    });
    await newListing.save();
    console.log("Data Saver SucessFully");
    res.redirect("/listings");
  }),
);

//one listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("show.ejs", { listing });
  }),
);

//update
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("edit.ejs", { listing });
});
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new ExpressError(400, "Invalid Data");
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deleteData = await Listing.findByIdAndDelete(id);
  console.log(deleteData);
  res.redirect("/listings");
});

// Add review Post request
app.post(
  "/listings/:id/reviews",
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
app.delete("/listings/:id/reviews/:reviewId" , async(req,res)=>{
  let {id , reviewId} = req.params
  let listing = await Listing.findByIdAndUpdate(id , {$pull : {reviews: reviewId}})
  await Reviews.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
})

//error Handling middleWares
app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  console.log(err);
  return res.render("error.ejs", { err });
});

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "New VIlla",
//         description: "By the beach",
//         price: 1500,
//         location: "Calangute Goa",
//         country: "India"
//     })
//     await sampleListing.save();
//     console.log("sample was Saved in Database")
//     res.send("Sucessful tresting")
// })

app.listen(8080, () => {
  console.log("server running on http://localhost:8080/listings");
});
