const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const messagesFile = path.join(__dirname, "messages.json");

// Ensure messages.json exists
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([]));
}

// Route: Submit form
app.post("/submit", async (req, res) => {
  try {
    const { firstname, lastname, message } = req.body;

    if (!firstname || !lastname || !message) {
      return res.status(400).send("All fields are required");
    }

    const messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));
    const newMessage = {
      firstname,
      lastname,
      message,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

    console.log("✅ Message saved");
    res.send("Message Sent Successfully!");
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).send("Error saving message");
  }
});

// Route: View messages
app.get("/messages", (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));

    let html = "<h1>Messages</h1><ul>";
    messages.forEach(m => {
      html += `<li>
        <strong>${m.firstname} ${m.lastname}</strong><br/>
        ${m.message}<br/>
        <small>${m.createdAt}</small>
      </li><hr/>`;
    });
    html += "</ul>";

    res.send(html);
  } catch (err) {
    res.status(500).send("Error fetching messages");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
