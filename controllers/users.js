const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};
module.exports.signup = async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash("error", "Login failed after registration!");
                return res.redirect("/signup");
            }
            req.flash("success", "Successfully signed up!");
            res.redirect("/listing");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};
module.exports.login = async (req, res) => {
        // This callback is not necessary, but can be used for additional logic if needed
        req.flash("success", "Welcome back!");
        res.redirect(res.locals.redirectUrl || "/listing");
};
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", "Something went wrong!");
            return res.redirect("/listing");
        }
        req.flash("success", "Successfully logged out!");
        res.redirect("/listing");
    });
};