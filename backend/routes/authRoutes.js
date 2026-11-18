const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// STUDENT REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      gender,
      course,
      address,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !age ||
      !gender ||
      !course ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      age,
      gender,
      course,
      address,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// INITIAL ADMIN CREATION
router.post("/admin-register", async (req, res) => {
  try {
    const { name, email, password, adminSetupKey } = req.body;

    if (adminSetupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({
        message: "Invalid admin setup key",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Registration Error:", error.message);

    return res.status(500).json({
      message: "Admin registration failed",
    });
  }
});

module.exports = router;