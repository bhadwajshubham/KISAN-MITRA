
const express = require("express");
const bcrypt = require("bcryptjs");

// In-memory user store
const users = [];

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;


  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


  // Save new user
  users.push({ email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


  // Find user
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
