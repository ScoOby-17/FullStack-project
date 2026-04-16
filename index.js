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

const listings = require("./routes/Listing.js")
const reviews = require("./routes/review.js")

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


//home
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/listings" , listings)
app.use("/listings/:id/reviews" , reviews)




//error Handling middleWares
app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  console.log(err);
  return res.render("error.ejs", { err });
});



app.listen(8080, () => {
  console.log("server running on http://localhost:8080/listings");
});
