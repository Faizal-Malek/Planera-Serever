const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cors = require("cors")
const {test, registerUser, loginUser, getProfile, users}  = require("../controllers/authController")

// middleware 
router.use( cors({
    credentials: true,
    origin:"http://localhost:8080"
}))

router.get('/', test)
router.post('/register', registerUser)
router.post("/login", loginUser)
router.get('profile', getProfile)
router.get("/users", users);
module.exports = router;