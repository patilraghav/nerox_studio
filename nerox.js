// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// --- WEBSITE SERVER ---
// Serve static files (like your nerox.css, images, etc.) from the current directory
app.use(express.static(__dirname));

// Serve the main HTML website on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'nerox.html'));
});

// --- API BACKEND ---
// Connect to your MongoDB Atlas Database
// Note: We encoded the '@' in your password to '%40' which is required for MongoDB connections!
mongoose.connect('mongodb+srv://patiladarsh120_db_user:peDR6ugY2mgHL%40c@cluster0.4fh4h7e.mongodb.net/nexora?retryWrites=true&w=majority')
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Lead Schema (What info are we saving?)
const leadSchema = new mongoose.Schema({
    name: String,
    email: String,
    projectType: String,
    budget: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, projectType, budget, message } = req.body;

        // Save directly to MongoDB Atlas
        const newLead = new Lead({ name, email, projectType, budget, message });
        await newLead.save();

        console.log(`📨 NEW LEAD SAVED TO MONGODB: ${name}`);

        // Send a success response back to the HTML
        res.status(200).json({ success: true, message: "Lead captured successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Something went wrong." });
    }
});

// API Endpoint to get all leads (Admin view)
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ date: -1 }); // Get all leads, newest first
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to fetch leads." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ SUCCESS! Nexora Website & API running on http://localhost:${PORT}`);
});