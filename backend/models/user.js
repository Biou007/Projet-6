const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator").default;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Plugin pour valider l'unicité des emails
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
