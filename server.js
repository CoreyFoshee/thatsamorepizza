const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Use express-ejs-layouts
app.use(expressLayouts);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'Logo')));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: "That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Settle the great debate between Chicago Deep Dish and New York Thin Crust pizza. Authentic Italian pizza in Metairie, Louisiana.",
        currentPage: 'home'
    });
});

app.get('/menu', (req, res) => {
    res.render('menu', { 
        title: "Menu - That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Explore our complete menu featuring both Chicago Deep Dish and New York Thin Crust pizza. From authentic Italian pasta to wings, sandwiches, and desserts.",
        currentPage: 'menu'
    });
});

app.get('/catering', (req, res) => {
    res.render('catering', { 
        title: "Catering - That's Amore Pizzeria | Corporate & Event Catering in Metairie",
        description: "Professional catering services for corporate events, parties, and special occasions. Pizza trays, pasta, appetizers, and complete meal packages available.",
        currentPage: 'catering'
    });
});

app.get('/franchise', (req, res) => {
    res.render('franchise', { 
        title: "Franchise - That's Amore Pizzeria | Own a Slice of Something Great",
        description: "Join the That's Amore family! Franchise opportunities available with comprehensive training, marketing support, and proven business model.",
        currentPage: 'franchise'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: "Contact - That's Amore Pizzeria | Visit Us in Metairie, Louisiana",
        description: "Contact That's Amore Pizzeria in Metairie, Louisiana. Visit us at 4441 West Metairie Ave or call (504) 463-5384 for orders and reservations.",
        currentPage: 'contact'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 That's Amore Pizzeria website running on http://localhost:${PORT}`);
    console.log(`🍕 The great pizza debate is ready!`);
});

module.exports = app;
