const express = require("express");
const aiRoutes = require('./routes/ai.routes');
const activityRoutes = require('./routes/activity.routes');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // ✅ load .env

const app = express();

// ✅ Use environment variable for MongoDB URI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB  connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Hello World, Chando");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/ai', aiRoutes);
app.use('/api/activity', activityRoutes);

module.exports = app;
