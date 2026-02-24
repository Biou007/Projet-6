const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// 1) On autorise seulement ces types d'images
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// 2) Au lieu d'enregistrer directement dans "images/", on garde l'image en mémoire (temporaire)
const storage = multer.memoryStorage();

// 3) On configure multer
const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Format d'image non autorisé (jpg, jpeg, png uniquement)"),
      );
    }
  },
}).single("image");

// 4) Middleware final : multer reçoit l'image, puis sharp l'optimise et l'enregistre dans /images
module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Si aucune image n'est envoyée, on continue sans rien faire
    if (!req.file) {
      return next();
    }

    try {
      // On crée un nom de fichier unique, et on force le format .webp
      const baseName = req.file.originalname.split(" ").join("_").split(".")[0];
      const filename = `${baseName}_${Date.now()}.webp`;

      // Chemin où on va enregistrer l'image optimisée
      const outputPath = path.join("images", filename);

      // Sharp : on convertit + compresse
      await sharp(req.file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Très important : on met à jour filename pour que ton code existant continue de marcher
      req.file.filename = filename;

      next();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de l'optimisation de l'image" });
    }
  });
};
