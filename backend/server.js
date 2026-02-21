require("dotenv").config(); // Permet de lire le fichier .env

const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connexion à MongoDB réussie !");
  })
  .catch((error) => {
    console.log("Connexion à MongoDB échouée !", error);
  });

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
