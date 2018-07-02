const express = require("express"),
    sessions = require("client-sessions"),
    multer = require("multer"),
    bodyParser = require("body-parser");


const accounts = require("./lib/accounts.js"),
    images = require("./lib/images.js"),
    dashboard = require("./lib/dashboard");

const upload = multer({ dest: "./uploads" });

//express settings
const app = express();
const port = 3000;

//setting ejs as render engine
app.set("view engine", "ejs");

//app settings
app.use(express.static("views"));
app.use(bodyParser.urlencoded({
    extended: true
}));

//session setttings
app.use(sessions({
  cookieName: 'session',
  secret: 'blargadeeblargblarg',
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
}));

//account routes
app.post("/signUp", accounts.signUp);
app.post("/logIn", accounts.logIn);
app.get("/logOut", accounts.logOut);
app.post("/delAccount", accounts.delAccount);

//image routes
app.post("/upload", upload.single("photo"), images.upload);
app.get("/images/:id", images.download);

//dashboard
app.get("/dashboard", dashboard.dashboard);

app.listen(port, function(){
    console.log("listening on port: " + port);
});