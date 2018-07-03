const ejs = require("ejs"),
    bcrypt = require("bcrypt"),
    validator = require("email-validator"),
    sessions = require("client-sessions"),
    crypto = require("crypto"),
    db = require("diskdb");

//connecting too db
db.connect("data/", ["users", "images"]);

function signUp(req, res){
    
    if(req.body.username){ //check if user gave username
        if(req.body.password){ //check if user gave password
            if(req.body.passwordConfirm === req.body.password){ //check if password matches confirmation
                if(req.body.email && validator.validate(req.body.email)){ //check if user gave valid email
                    if(!db.users.findOne({ username: req.body.username })){ //check if db could not find a user with that username
                        if(!db.users.findOne({ email: req.body.email })){ //check if db could not find user with that email
                            bcrypt.hash(req.body.password, 10, function(err, hash){
                                if(!err){ //check if no error occured during hash
                                    db.users.save({ //if all conditions met save user too db
                                        username: req.body.username,
                                        password: hash,
                                        email: req.body.email,
                                        sessionKey: ""
                                    });

                                    res.redirect("/dashboard");
                                } else {
                                    res.render("error.ejs", {error: "An error occured"}); //if hash error occurs
                                }
                            });
                        } else {
                            res.render("error.ejs", {error: "email already being used"}); //if email is already being used
                        }
                    } else {
                        res.render("error.ejs", {error: "username already being used"}); //if username is already being used
                    }
                } else {
                    res.render("error.ejs", {error: "invalid email"}); //if user did not input email or email is invalid
                }
            } else {
                res.render("error.ejs", {error: "passwords do not match"}); //if users password confirmation does not match password
            }
        } else {
            res.render("error.ejs", {error: "no password given"}); //if user did not input password
        }
    } else {
        res.render("error.ejs", {error: "no username given"}); //if user did not input username
    }
};

function logIn(req, res){
    
    if(req.body.username){ //check if user input username
        if(req.body.password){ //check if user input password
            let user = db.users.findOne({ username: req.body.username }); //attempt too get user from db

            if(user){ //if user exists
                bcrypt.compare(req.body.password, user.password, function(err, result){
                    if(!err){ //if no error occured
                        if(result){ //if password is correct
                            crypto.randomBytes(64, function(err, buffer){
                                if(!err){ //if no error

                                    let token = buffer.toString("base64"); //create session key
                                    db.users.update(
                                        { username: req.body.username }, //get user by username
                                        { sessionKey: token }, //update session token
                                        {
                                            multi: false,
                                            upsert: false
                                        });

                                    req.session.user = token; //set session key
                                    res.redirect("/dashboard"); //send too dashboard
                                } else {
                                    res.render("error.ejs", {error: "An error occured generating session key"}); //key generation error
                                }
                            }); 

                        } else {
                            res.render("error.ejs", {error: "password incorrect"}); //if user did not input correct password
                        }
                    } else {
                        res.render("error.ejs", {error: "An error occured"}); //if comparison error occurs
                    }
                });
            } else {
                res.render("error.ejs", {error: "user by that username could not be found"}); //if user doesn't exist
            }
        } else {
            res.render("error.ejs", {error: "no password given"}); //if user did not input password
        }
    } else {
        res.render("error.ejs", {error: "no username given"}); //if user did not input username
    }
};

function logOut(req, res){
    
    if(req.session.user){ //if user is logged in
        let user = db.users.findOne({ sessionKey: req.session.user });

        if(user){
            db.users.update( //reset session key
                { username: req.body.username }, //get user by username
                { sessionKey: "" }, //update session token
                {
                    multi: false,
                    upsert: false
                });

            req.session.reset(); //reset session
            res.redirect("/"); //send back too home page
        }
    } else { //if not logged in, send too main page
        res.redirect("/");
    }
};

function delAccount(req, res){
    
    if(req.session.user){ //make sure user is logged in
        if(req.body.password){ //make sure user input password
            let user = db.users.findOne({ sessionKey: req.session.user }); //get user
            bcrypt.compare(req.body.password, user.password, function(err, result){
                if(!err){ //if no error
                    let user = db.users.findOne({ sessionKey: req.session.user }); //get user
                    if(user){ //if user was found
                        db.images.remove({ //delete all of users images from db
                            user: user.username,
                            multi: true
                        });

                    } else {
                        res.render("error.ejs", {error: "an error ocured"}); //if user could not be found
                    }

                    db.users.remove({ sessionKey: req.session.user }, false); //false is for multi option
                    req.session.reset();

                    res.redirect("/");
                } else {
                    res.render("error.ejs", {error: "incorrect password"}); //if password is incorrect
                }
            })
        } else {
            res.render("error.ejs", {error: "no password sent"}); //if user didnt input password
        }
    } else { //if not logged in, send too main page
        res.redirect("/");
    }
};

module.exports.signUp = signUp;
module.exports.logIn = logIn;
module.exports.logOut = logOut;
module.exports.delAccount = delAccount;