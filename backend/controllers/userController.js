// backend/controllers/userController.js
const { supabase } = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByUsername } = require("../models/userModel");

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isBcryptHash = typeof user.password === "string" && user.password.startsWith("$2");
    const isPasswordValid = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        userRole: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        userRole: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { login };
