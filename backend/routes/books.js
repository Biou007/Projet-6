const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const booksCtrl = require("../controllers/books");

// CREATE
router.post("/", auth, multer, booksCtrl.createBook);

// READ ALL
router.get("/", auth, booksCtrl.getAllBooks);

// READ ONE
router.get("/:id", auth, booksCtrl.getOneBook);

// UPDATE
router.put("/:id", auth, multer, booksCtrl.updateBook);

// DELETE
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
