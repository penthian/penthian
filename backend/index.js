const express = require("express");
const kycRouteVeriff = require("./routes/kycRouteVeriff");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 5001;

// List of allowed domains
const allowedOrigins = [
  "http://localhost:3000", // Local development URL
  "https://www.penthian.com", //TODO: add your allowed domains here
  "https://penthian.com", //TODO: add your allowed domains here
  "https://bitstakeplatform.com", //TODO: add your allowed domains here
  "https://bitstake-rwa-marketplace.vercel.app", //TODO: add your allowed domains here
];

//======================== VARIABLES & MIDDLEWARES ========================\
const MONGO_URI = "mongodb+srv://admin:admin12345@penthian.q1acfij.mongodb.net/?retryWrites=true&w=majority&appName=Penthian"
//======================== VARIABLES & MIDDLEWARES ========================


// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow the request if the origin is in the allowed list
      callback(null, true);
    } else {
      // Reject the request if the origin is not allowed
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS middleware with the dynamic options

app.use(express.json());


// MongoDB connection with caching for serverless environments
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log("Connected to MongoDB...");
    cachedDb = db;
    return db;
  } catch (err) {
    console.error("Could not connect to MongoDB:", err);
    throw err;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    throw new Error("Database connection failed");
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World, I am alive!" });
});

app.use("/api/kyc", kycRouteVeriff);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
