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
   DATABASE CONNECTION
========================= */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* =========================
   MESSAGE SCHEMA
========================= */
const messageSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

/* =========================
   ROUTES
========================= */

// Home (optional)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Submit form
app.post("/submit", async (req, res) => {
  try {
    const { firstname, lastname, message } = req.body;

    if (!firstname || !lastname || !message) {
      return res.status(400).send("All fields are required");
    }

    await Message.create({ firstname, lastname, message });

    console.log("💌 Message saved");
    res.send("Message Sent Successfully!");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// View messages (Admin page)
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    let html = `
      <h1>Wedding Wishes 💖</h1>
      <style>
        body { font-family: Arial; padding: 20px }
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
  } catch (err) {
    res.status(500).send("Error loading messages");
  }
});

/* =========================
   EXPORT FOR VERCEL
========================= */
module.exports = app;
