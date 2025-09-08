const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_API;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
};
module.exports.newListingForm = async (req, res) => {
    res.render("listing/new")
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listingdata = await Listing.findById(id)
    .populate({
        path: "reviews", populate: {path: "author"}
    })
    .populate("owner");
    if(!listingdata){
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }   
    res.render("listing/show", { listingdata })
};

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;
    let newlisting = new Listing(req.body.listing)
    newlisting.owner = req.user._id; // Set the owner to the currently logged-in user
    newlisting.image = { url, filename };
    newlisting.geometry = response.body.features[0].geometry;
    await newlisting.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listing");
};
module.exports.renderEditListing = async (req, res) => {
    let { id } = req.params;
    const listingdata = await Listing.findById(id)
    if(!listingdata){
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    res.render("listing/edit", { listingdata })
};
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename };
    }
    await updatedListing.save();
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listing/${id}`)
};
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id)
    console.log(deleted)
    req.flash("success", "Successfully deleted the listing!");

    res.redirect("/listing")
};
