const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for a sample collection
const SampleSchema = new mongoose.Schema({
    name: String,
    age: Number
});
const SampleModel = mongoose.model('Sample', SampleSchema);

// Define a route to fetch all documents from the sample collection
app.get('/samples', async (req, res) => {
    try {
        const samples = await SampleModel.find();
        res.json(samples);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
