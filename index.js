const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")

const app = express()

// database connection
mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 3000 // Wait up to 3000 milliseconds (3 seconds)
})
.then(() => console.log("database connected"))
.catch((e) => console.log("database connection failed:", e))

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

app.use('/', require('./routes/authRoutes'))

const port = 8000
app.listen(port, () => console.log(`Server is running on port ${port}`))