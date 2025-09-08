const express = require("express");
const router = express.Router( {mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const review = require('../models/review.js');
const listing = require('../models/listing');
const { isLoggedIn, validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
//reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.deleteReview));

module.exports = router;