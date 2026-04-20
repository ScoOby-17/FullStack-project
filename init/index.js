const mongoose = require("mongoose");
const data = require("./data")
const Listing = require("../models/listing");

main().then((res)=>{
    console.log("connected to database NexList")
}).catch(err => console.log(err));

async function main() {
    const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
    await mongoose.connect(MONGO_URL);
}

// console.log(data.sampleListings)

const initDB = async()=>{
    await Listing.deleteMany({}); //initally clear database 
    await Listing.insertMany(data.data);
    console.log("Data insert sucessfully")
}
initDB()