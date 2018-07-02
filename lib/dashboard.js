const db = require("diskdb");

db.connect("data", ["users", "images"]);

function dashboard(req, res){
    if(req.session.user){
        let user = db.users.findOne({ sessionKey: req.session.user });

        if(user){
            let images = db.images.find({ user: user.username });
            let data;

            if(images.length === 0){
                data = ["nothing here yet! try uploading an image."];
            } else {
                data = images;
            }

            res.render("dashboard.ejs", {images: data});
        } else {
            res.render("error.ejs", {error: "session expired"});
        }
    } else {
        res.redirect("/"); // user does not have any session data send too login page
    }
};

module.exports.dashboard = dashboard;