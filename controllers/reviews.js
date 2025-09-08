const Review = require('../models/review');
const Listing = require('../models/listing');
module.exports.createReview = async(req, res) => {
    console.log(req.params.id);
    let foundlisting = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Set the author to the current user
    foundlisting.reviews.push(newReview);
    await newReview.save();
    await foundlisting.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listing/${foundlisting.id}`)
};
module.exports.deleteReview = async(req,res) =>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listing/${id}`);

};
