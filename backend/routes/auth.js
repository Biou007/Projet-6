const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Route signup
router.post("/signup", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hash,
    });

    await user.save();

    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Route login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      userId: user.id,
      token,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
