const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const listing = require('../models/listing');
const middleware = require("../middleware.js");
const { isLoggedIn ,isOwner ,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn , upload.single("listing[image]"),validateListing,  wrapAsync(listingController.createListing));
//new route
router.get("/new", isLoggedIn, wrapAsync(listingController.newListingForm));

//show a single listing
router.get("/:id", wrapAsync(listingController.showListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(listingController.renderEditListing));

//update route
router.put("/:id", isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));

//DELETE A ROUTE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;