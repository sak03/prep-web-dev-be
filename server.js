const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors")

const userRoute = require('./routes/userRoute')
const questionRoute = require('./routes/questionRoute');

app.use(express.json())
app.use(cors());


mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("Connected succesfully!");
    app.listen(process.env.PORT || 8000, (err) => {
      if (err) console.log("App not running, Error: ", err);
    });
  })
  .catch((err) => {
    console.log("DB Connection error: ", err);
  });

  app.use("/api/user" ,userRoute);
  app.use("/api/questions" ,questionRoute);

app.get("/", (req, res) => {
  res.send(`App is running on port number ${process.env.PORT}`);
});
