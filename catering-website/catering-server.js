const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3001; // Different port from main site

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'catering-layout');

// Use express-ejs-layouts
app.use(expressLayouts);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Routes
app.get('/', (req, res) => {
    res.render('catering-home', { 
        title: "That's Amore Catering | Professional Event Catering in Metairie",
        description: "Professional catering services for corporate events, parties, and special occasions. Pizza trays, pasta, appetizers, and complete meal packages available.",
        currentPage: 'home',
        pageScripts: []
    });
});

app.get('/menu', (req, res) => {
    res.render('catering-menu', { 
        title: "Catering Menu - That's Amore Catering | Complete Event Catering Menu",
        description: "Complete catering menu featuring pizza, pasta, appetizers, salads, and beverages. Perfect for corporate events, parties, and special occasions.",
        currentPage: 'menu',
        pageScripts: []
    });
});

app.get('/services', (req, res) => {
    res.render('catering-services', { 
        title: "Catering Services - That's Amore Catering | Corporate & Event Services",
        description: "Professional catering services for corporate events, private parties, and special occasions. From setup to cleanup, we handle everything.",
        currentPage: 'services',
        pageScripts: []
    });
});

app.get('/contact', (req, res) => {
    res.render('catering-contact', { 
        title: "Contact - That's Amore Catering | Get Your Catering Quote",
        description: "Contact That's Amore Catering for your next event. Get a custom quote, ask questions, or place your catering order.",
        currentPage: 'contact',
        pageScripts: []
    });
});

app.get('/quote', (req, res) => {
    res.render('catering-quote', { 
        title: "Get Quote - That's Amore Catering | Custom Catering Quote",
        description: "Get a custom catering quote for your event. Fill out our form and we'll provide a personalized quote for your needs.",
        currentPage: 'quote',
        pageScripts: []
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Catering website server is running!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🍽️  That's Amore Catering website running on http://localhost:${PORT}`);
    console.log(`📞 Ready to handle catering inquiries!`);
});

module.exports = app;
