const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname))); // Serves files from the root directory
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/profiles', express.static(path.join(__dirname, 'profiles')));


// Route for the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read the database file
    fs.readFile('database.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading database file:', err);
            return res.status(500).send('Internal Server Error');
        }

        const users = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let isAuthenticated = false;
        let redirectProfile = '';

        for (const userLine of users) {
            const [dbUsername, dbPassword] = userLine.split(',');
            if (username === dbUsername && password === dbPassword) {
                isAuthenticated = true;
                redirectProfile = dbUsername; // Assuming username is the profile folder name
                break;
            }
        }

        if (isAuthenticated) {
            // Redirect to the specific user's profile page
            // Adjust the path based on your exact file structure
            res.redirect(`/profiles/${redirectProfile}/${redirectProfile}.html`);
        } else {
            // Redirect back to login with an error (you can add a query param for error message)
            res.redirect('/?error=invalidcredentials');
            // Or render the login page again with an error message
            // res.send('Invalid username or password. <a href="/">Try again</a>');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});