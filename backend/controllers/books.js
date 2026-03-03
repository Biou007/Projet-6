const fs = require("fs").promises;
const path = require("path");
const Book = require("../models/book");

// CREATE
exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

    const book = new Book({
      ...bookObject,
      userId: req.userId,
      imageUrl,
      ratings: [],
      averageRating: 0,
    });

    await book.save();
    return res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    console.log("ERREUR CREATE BOOK:", error);
    return res.status(500).json({ message: "Erreur serveur." });
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

    return res.status(200).json({ message: "Livre modifié !" });
  } catch (error) {
    return res.status(500).json({ error });
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

    await fs.unlink(filePath);

    await Book.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: "Livre supprimé !" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// RATE BOOK
exports.rateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    const { rating } = req.body;

    // 1️⃣ Vérifier que la note est entre 0 et 5
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 0 et 5" });
    }

    // 2️⃣ Vérifier que l'utilisateur n'a pas déjà noté
    const alreadyRated = book.ratings.find((r) => r.userId === req.userId);

    if (alreadyRated) {
      return res.status(400).json({
        message: "Vous avez déjà noté ce livre",
      });
    }

    // 3️⃣ Ajouter la nouvelle note
    book.ratings.push({
      userId: req.userId,
      grade: rating,
    });

    // 4️⃣ Recalculer la moyenne
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = total / book.ratings.length;

    await book.save();

    return res.status(201).json(book);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// GET BEST RATED
exports.getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};
