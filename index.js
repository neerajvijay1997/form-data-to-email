const express = require("express");

const app = express();

require("dotenv").config();

const { body, validationResult } = require("express-validator");

const port = 8000;

var cors = require('cors')
app.use(cors())


app.use(express.urlencoded());

app.use(express.json());

const expressLayouts = require("express-ejs-layouts");

const nodemailer = require("nodemailer");

const mailGun = require("nodemailer-mailgun-transport");

const auth = {
  auth: {
    api_key: process.env.API_KEY  , // TODO: Replace with your mailgun API KEY
    domain: process.env.DOMAIN, // TODO: Replace with your mailgun DOMAIN
  },
};

const transporter = nodemailer.createTransport(mailGun(auth));

app.use(expressLayouts);
//app.use(express.static("./assets"));

// extract style and scripts from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

//app.use(expressLayouts);

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("form");
});

app.post(
  "/form",
  [
    body("name")
      .trim()
      .isAlpha()
      .withMessage("name error>>not alpabhet")
      .notEmpty()
      .withMessage("name error>>space is empty")
      .isLength({ min: 3, max: 6 })
      .withMessage(
        "name error>> name should have minimum letters of 3 and maximum letters of 6"
      ),
    body("email")
      .notEmpty()
      .withMessage("email error>>empty space")
      .isEmail()
      .withMessage("email error>>not a valid email")
      .contains("gmail")
      .withMessage("email error>> only gmails are allowed"),
    body("number")
      .notEmpty()
      .withMessage("phone error>>space is empty")
      .isNumeric()
      .withMessage("phone error>>only number are allowed")
      .isLength({ min: 10, max: 10 })
      .withMessage("phone error>> phone should have 10 numbers"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //console.log(errors)
      //return res.send(errors)
      var arr = [];
      errors.array().forEach((error) => {
        console.log(error.msg);
        arr.push(error.msg);
      });

      return res.render("error", {
        data: arr,
      });
    }
    console.log(req.body);
    const { name, number, email } = req.body;

    transporter.sendMail(
      {
        from: "neeraj.rtly@gmail.com",
        to: "neeraj.rtly@gmail.com", // An array if you have multiple recipients.
        //cc:'second@domain.com',
        //bcc:'secretagent@company.gov',
        subject: "form data",
        //'replyTo': 'reply2this@company.com',
        //You can use "html:" to send HTML email content. It's magic!
        //html: '<b>Wow Big powerful letters</b>',
        //You can use "text:" to send plain-text content. It's oldschool!
        text: ` name : ${name} , phone : ${number} , email: ${email}`,
      },
      (err, info) => {
        if (err) {
          console.log(`Error: ${err}`);
        } else {
          console.log(`data sent successfully`);
          return res.render("success");
        }
      }
    );

    //console.log("assume email sent");
  }
);

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }

  console.log(`Server is running on port: ${port}`);
});
