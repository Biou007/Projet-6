const express = require("express");

const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const Book = require("../models/book");

router.post("/", auth, multer, async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

    const book = new Book({
      userId: req.userId,
      title: req.body.title,
      author: req.body.author,
      year: req.body.year,
      genre: req.body.genre,
      imageUrl,
      ratings: [],
      averageRating: 0,
    });

    await book.save();

    res.status(201).json({ message: "Livre enregistré en base !" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
