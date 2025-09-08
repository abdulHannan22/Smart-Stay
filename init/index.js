const mongoose = require ("mongoose");
const initData = require ("./data")
const listing = require ("../models/listing");
const express = require ("express")
MONGO_URL = "mongodb://localhost:27017/ExplorePlace"

main().then(() =>{
    console.log("connected to mongodb")
})

async function main (){
    await mongoose.connect(MONGO_URL)
}
const initDB = async ( )=>{
    await listing.deleteMany({});
    initData.data = initData.data.map((item) => ({ ...item, owner : "687a430f63fed2a0ea55e6ef" })); // Replace with actual user ID
    await listing.insertMany(initData.data)
    console.log("data was initialized")
}
initDB();
