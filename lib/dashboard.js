const db = require("diskdb");

db.connect("data", ["users", "files"]);

function dashboard(req, res){
    
    if(req.session.user){
        let user = db.users.findOne({ sessionKey: req.session.user });

        if(user){
            let files = db.files.find({ user: user.username });
            let data;

            if(files.length < 1){
                data = ["nothing here yet! try uploading an image."];
            } else {
                data = files;
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