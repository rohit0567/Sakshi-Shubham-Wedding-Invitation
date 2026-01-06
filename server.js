const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   DATABASE CONNECTION (SAFE)
========================= */
let isMongoConnected = false;

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      isMongoConnected = true;
      console.log("✅ MongoDB Connected");
    })
    .catch(() => {
      console.log("⚠️ MongoDB connection failed (form will still work)");
    });
} else {
  console.log("⚠️ MONGODB_URI not found (running without database)");
}

/* =========================
   MESSAGE SCHEMA
========================= */
const messageSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

/* =========================
   ROUTES
========================= */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Submit Form (ALWAYS SUCCESS)
app.post("/submit", async (req, res) => {
  const { firstname, lastname, message } = req.body;

  // 1️⃣ Always respond success to user
  res.status(200).send("Message Sent Successfully ❤️");

  // 2️⃣ Try saving silently (optional)
  try {
    if (isMongoConnected && firstname && lastname && message) {
      await Message.create({ firstname, lastname, message });
      console.log("💌 Message saved");
    } else {
      console.log("⚠️ Message not saved (DB unavailable or empty fields)");
    }
  } catch (err) {
    console.log("⚠️ Error saving message (ignored)");
  }
});

// Admin Messages Page
app.get("/messages", async (req, res) => {
  if (!isMongoConnected) {
    return res.send("<h2>Database not connected</h2>");
  }

  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    let html = `
      <h1>Wedding Wishes 💖</h1>
      <style>
        body { font-family: Arial; padding: 20px; background: #fafafa }
        li { margin-bottom: 20px }
      </style>
      <ul>
    `;

    messages.forEach(m => {
      html += `
        <li>
          <strong>${m.firstname} ${m.lastname}</strong><br>
          ${m.message}<br>
          <small>${new Date(m.createdAt).toLocaleString()}</small>
        </li><hr>
      `;
    });

    html += "</ul>";
    res.send(html);
  } catch {
    res.status(500).send("Error loading messages");
  }
});

/* =========================
   EXPORT FOR VERCEL
========================= */
module.exports = app;
