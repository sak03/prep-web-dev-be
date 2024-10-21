const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  userStatus: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
  },
  city: {
    type: String,
  },
}, {timestamps:true});

const User = mongoose.model("User", userSchema);

module.exports = User;
