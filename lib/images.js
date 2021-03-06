const ejs = require("ejs"),
    shortid = require("shortid"),
    fs = require("fs"),
    db = require("diskdb");

//set up db connection
db.connect("data/", ["users", "files"]);



function upload(req, res){
    
    if(req.session.user){ //check if user is logged in
        //handle account based uploads
        let user = db.users.findOne({ sessionKey: req.session.user }); //get user by session key
        if(user){ //if user exists
            let id = shortid.generate(); //create image id
            db.files.save({ //save image in database
                id: id,
                path: req.file.filename,
                user: user.username
            });

            res.redirect("/dashboard"); //once uploaded send user too image
        } else { //if user does not exist
            res.render("error.ejs", {error: "An error occured while uploading the image"}); //users account could not be found
        }
    } else { //if user is not logged in
        //handle anonymous uploads
        let id = shortid.generate(); //create id
        db.files.save({
            id: id,
            path: req.file.filename
        });

        res.redirect("/images/" + id); //once uploaded send user too image
    }
};


function download(req, res){
    
    let file = db.files.findOne({ id: req.params.id }); //get image from db

    if(file){ //if image exists
        res.redirect("/" + file.path);
        
    } else {
        res.render("error.ejs", {error: "image could not be found"}); //image could not be found
    }

};

module.exports.upload = upload;
module.exports.download = download;
