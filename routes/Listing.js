const express = require("express")
const wrapAsync = require("../utilities/wrapAsync");
const ExpressError = require("../utilities/ExpressError");
const Listing = require("../models/listing");
const router = express.Router()

//index
router.get("/", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("index.ejs", { allListings });
});

//create listing
router.get("/new", (req, res) => {
  res.render("new.ejs");
});

//create Route
router.post(
  "/",
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
    req.flash("sucess","Listing created sucessfully");
    res.redirect("/listings");
  }),
);

//one listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("show.ejs", { listing });
  }),
);

//update
router.get("/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("edit.ejs", { listing });
});
router.put("/:id", async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new ExpressError(400, "Invalid Data");
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

//Delete Route
router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  let deleteData = await Listing.findByIdAndDelete(id);
  req.flash("deleted","Listing Deleted Sucessfully");
  console.log(deleteData.title);
  res.redirect("/listings");
});

module.exports = router;