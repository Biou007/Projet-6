const fs = require("fs");
const path = require("path");
const Book = require("../models/book");

// CREATE
exports.createBook = async (req, res) => {
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
};

// READ ALL
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// READ ONE
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ error });
  }
};

// UPDATE
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      : book.imageUrl;

    await Book.updateOne(
      { _id: req.params.id },
      {
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        genre: req.body.genre,
        imageUrl,
      },
    );

    res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// DELETE
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    const filePath = path.join(__dirname, "..", "images", filename);

    fs.unlink(filePath, async (error) => {
      if (error) {
        console.log("Erreur suppression image :", error);
      }

      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Livre supprimé !" });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
