const { hashPassword, comparePassword } = require("../helpers/auth");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Test route
const test = (req, res) => {
  res.json("test is working");
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directoryPath = path.join(__dirname, '../clientImages/uploads');
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    cb(null, directoryPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage }).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'proofOfResidence', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]);

const registerUser = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      const { name, surname, email, Service, phone, password, userType } = req.body;

      // Validate required fields (simplified for brevity)
      if (!name || !surname || !Service || !phone || !email || !password) {
        return res.status(400).json({ error: "All required fields must be filled" });
      }

      // Additional validations and user creation
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Create the user without document paths initially
      const user = await User.create({
        name,
        surname,
        email,
        Service,
        phone,
        password: await hashPassword(password),
        userType,
        documents: {}
      });

      // Rename uploaded files to include user ID
      const documents = {};
      if (req.files) {
        for (const fileKey in req.files) {
          if (req.files[fileKey].length > 0) {
            const file = req.files[fileKey][0];
            const newFilename = `${user._id}-${file.originalname}`;
            const newFilePath = path.join(file.destination, newFilename);

            // Rename the file
            fs.renameSync(file.path, newFilePath);

            // Store the new path in the documents object
            documents[fileKey] = newFilePath;
          }
        }
      }

      // Update user with document paths
      user.documents = documents;
      await user.save();

      res.status(201).json({ success: true, message: "Registration successful. Please login.", user });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

// Login user function
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password is incorrect" });
    }

    // Generate JWT token
    jwt.sign(
      { email: user.email, id: user._id, name: user.name, userType: user.userType }, // Include userType in the token payload
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) {
          console.error("JWT generation error:", err);
          return res.status(500).json({ error: "Token generation failed" });
        }
        
        res.cookie("token", token, { httpOnly: true }).json({
          success: "Login successful",
          user: {
            email: user.email,
            id: user._id,
            name: user.name,
            userType: user.userType, // Include userType in response
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    // res.status(500).json({ error: "An internal server error occurred" });
  }
};


// const loginUser = async (req, res) => {
//   res.json("test is working");
//   const
// }

// Get profile function
const getProfile = (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized access" });
      }
      res.json(user);
    });
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};

// Get all users function
const users = async (req, res) => {
  try {
    const userList = await User.find({});
    res.json({ users: userList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An internal server error occurred" });
    res
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
  users
};
