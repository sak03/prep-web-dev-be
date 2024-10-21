const express = require("express");
const Question = require("../models/questionModel");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Create a question
router.post("/create", verifyToken, async (req, res) => {
  try {
    // Extract userId from the verified token (assuming it is stored there)
    const userId = req.user.id;
    const bodyData = req.body; 

    // Create a new question with createdBy field set to the logged-in user's ID
    const newQuestion = new Question({
      createdBy: userId, // Set createdBy to userId
      question: bodyData.question,
      answer: bodyData.answer,
      category: bodyData.category,
      subCatagory: bodyData.subCatagory,
      code: bodyData.code,
      isPrivate: bodyData.isPrivate,
      isBookmarked: bodyData.isBookmarked,
    });

    // Save the question to the database
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error saving the question", error });
  }
});

// update a question
router.patch("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Extract userId from the verified token (assuming it is stored there)
    const userId = req.user.id;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the logged-in user is the creator of the question
    if (question.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this question" });
    }

    // Save the question to the database
    const updateQuestion = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    //   await newQuestion.save();
    res.status(201).json(updateQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error saving the question", error });
  }
});

// Get questions created by the logged-in user for a specific category
router.get("/get/:category", verifyToken, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id; // Get the logged-in user ID from the request (assuming verifyToken middleware sets req.user)

    // Find questions created by the user with the specified category
    const userQuestions = await Question.find({
      createdBy: userId,
      category: category,
    });

    if (userQuestions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(userQuestions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Get public questions  created by all users 
router.get("/getAll", async (req, res) => {
  try {

    const userQuestions = await Question.find({
      isPrivate: false,
    });

    if (userQuestions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(userQuestions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// saved or bookmarked questions ======
router.get("/savedQuestions", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id; // Get the logged-in user ID from the request (assuming verifyToken middleware sets req.user)
  
      // Find questions created by the user with the specified category
      const userQuestions = await Question.find({
        createdBy: userId,
        isBookmarked: true,
      });
  
      if (userQuestions.length === 0) {
        return res.status(200).json([]);
      }
  
      res.status(200).json(userQuestions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching questions", error });
    }
  });

// get question by id
router.get("/getDetails/:questionId", verifyToken, async (req, res) => {
  const { questionId } = req.params;
  try {
    const questionDetails = await Question.findById({ _id: questionId });
    res.status(200).json(questionDetails);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
