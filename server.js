const express = require("express"),
    path = require("path"),
    crypto = require("crypto"),
    compression = require('compression'),
    sessions = require("client-sessions"),
    multer = require("multer"),
    bodyParser = require("body-parser");


const accounts = require("./lib/accounts.js"),
    images = require("./lib/images.js"),
    dashboard = require("./lib/dashboard");
    
let storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    })
  }
})

let upload = multer({ storage: storage });

//express settings
const app = express();
const port = process.env.PORT;
const ip = process.env.IP;
app.use(compression());

//setting ejs as render engine
app.set("view engine", "ejs");

//app settings
app.use(express.static("views"));
app.use(express.static("uploads"));
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

app.listen(port, ip, function(){
    console.log("listening on port: " + port);
});