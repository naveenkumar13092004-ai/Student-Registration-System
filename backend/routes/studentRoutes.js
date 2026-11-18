
const express = require("express");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET ALL STUDENTS
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// UPDATE STUDENT
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "age",
      "gender",
      "course",
      "address",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();

      const existingEmail = await User.findOne({
        email: updateData.email,
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email is already used by another account",
        });
      }
    }

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
    });
  }
});

// DELETE STUDENT
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
    });
  }
});

module.exports = router;
