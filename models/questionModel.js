const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Referencing the user's _id
      ref: "User", // reference from User model
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["FE", "BE", "DB", "Other"], // Fixed values
      default: "Other",
      required: true,
    },
    subCategory: {
      type: String,
      default: "Mixed",
    },
    code: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Adding an index on createdBy for better query performance
questionSchema.index({ createdBy: 1 });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
