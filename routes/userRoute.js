const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// === create user api ===
router.post("/create", async (req, res) => {
  const {
    name,
    email,
    mobile,
    userType,
    userStatus,
    password,
    dateOfBirth,
    city,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userAdded = await User.create({
      name,
      email,
      mobile,
      userType,
      userStatus,
      password: hashedPassword,
      dateOfBirth,
      city,
    });
    res.status(201).json(userAdded);
  } catch (error) {
    res.status(400).json(error);
  }
});

// === update user by id =======
router.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { password, ...otherUpdates } = req.body; // Extract password if it's included in the request

  try {
    // Check if the password is being updated
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      otherUpdates.password = hashedPassword; // Set the hashed password in updates
    }

    // Update user with other fields and the hashed password if applicable
    const updatedUser = await User.findByIdAndUpdate(id, otherUpdates, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json(error);
  }
});

// === get all user =======
router.get("/get", async (req, res) => {
  try {
    const findAllUsers = await User.find();
    res.status(200).json(findAllUsers);
  } catch (error) {
    res.status(400).json(error);
  }
});

// === get user by id =======
router.get("/getById/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleUser = await User.findById({ _id: id });
    res.status(200).json(singleUser);
  } catch (error) {
    res.status(400).json(error);
  }
});

// === delete user by id =======
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleUser = await User.findByIdAndDelete({ _id: id });
    res.status(200).json(singleUser);
  } catch (error) {
    res.status(400).json(error);
  }
});

// ====== use login ========
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id, // Use user ID as the payload
        email: user.email,
      },
      process.env.JWT_SECRET, // Secret key (use an environment variable)
      { expiresIn: "10h" } // Token expiration time (optional)
    );

    const resUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      userType: user.userType,
      userStatus: user.userStatus,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      token: token,
    };

    res.status(200).json(resUserData); // Sending user data without password
  } catch (error) {
    res.status(400).json({ message: "Error logging in", error });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail", // or any email service you use
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password (or App Password for Gmail)
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).send("User with that email does not exist");
    }

    // Generate password reset token
    const token = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour validity

    // Save the token and its expiry in the user data
    user.resetToken = token;
    user.resetTokenExpiry = resetTokenExpiry;

    // Construct the reset password URL
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: user.email, // receiver's email
      subject: "Password Reset",
      html: `<h3>You requested a password reset</h3>
             <p>Please click on the link below to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>
             <p>This link will expire in one hour.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Error sending email");
      }
      res.status(200).send("Password reset email sent");
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
