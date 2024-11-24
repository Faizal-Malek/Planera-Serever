const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  service: { type: String, default: null },  // Optional
  phone: { type: String, default: null },    // Optional
  password: { type: String, required: true },
  userType: { type: String, default: 'user' }, // Optional, default to 'user'
  documents: {  // Grouping all document-related fields
    cv: { type: String, default: null },
    proofOfResidence: { type: String, default: null },
    idDocument: { type: String, default: null },
    profilePicture: { type: String, default: null }
  }
});

// Create and export the User model
const User = mongoose.model('employees', userSchema);

module.exports = User;
