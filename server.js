// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS middleware
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://tdiddeku:AIPFNdVC4vrftb0g@cluster0.jahd52y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const UserModel = mongoose.model('User', userSchema);

// Enable CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.options('*', cors());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/user_dash.html', (req, res) => {
    // Check if the user is authenticated before serving the user dashboard
    if (req.session.user) {
        res.sendFile(__dirname + '/user_dash.html');
    } else {
        res.redirect('/');
    }
});



// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserModel({ username, password: hashedPassword });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'Registration successful! You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
