const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// In-memory storage for voting data (in production, use a database)
let votingData = {
    nyVotes: 0,
    chicagoVotes: 0,
    totalVotes: 0
};

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Use express-ejs-layouts
app.use(expressLayouts);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Add a test route to verify the server is working
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Server is running!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: "That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Settle the great debate between Chicago Deep Dish and New York Thin Crust pizza. Authentic Italian pizza in Metairie, Louisiana.",
        currentPage: 'home',
        pageScripts: []
    });
});

app.get('/menu', (req, res) => {
    res.render('menu', { 
        title: "Menu - That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Explore our complete menu featuring both Chicago Deep Dish and New York Thin Crust pizza. From authentic Italian pasta to wings, sandwiches, and desserts.",
        currentPage: 'menu',
        pageScripts: []
    });
});

app.get('/catering', (req, res) => {
    res.render('catering', { 
        title: "Catering - That's Amore Pizzeria | Corporate & Event Catering in Metairie",
        description: "Professional catering services for corporate events, parties, and special occasions. Pizza trays, pasta, appetizers, and complete meal packages available.",
        currentPage: 'catering',
        pageScripts: []
    });
});

app.get('/franchise', (req, res) => {
    res.render('franchise', { 
        title: "Franchise - That's Amore Pizzeria | Own a Slice of Something Great",
        description: "Join the That's Amore family! Franchise opportunities available with comprehensive training, marketing support, and proven business model.",
        currentPage: 'franchise',
        pageScripts: []
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: "Contact - That's Amore Pizzeria | Visit Us in Metairie, Louisiana",
        description: "Contact That's Amore Pizzeria in Metairie, Louisiana. Visit us at 4441 West Metairie Ave or call (504) 463-5384 for orders and reservations.",
        currentPage: 'contact',
        pageScripts: []
    });
});

app.get('/tv', (req, res) => {
    res.render('tv', { 
        title: "Live Voting Results - That's Amore Pizzeria",
        description: "Live real-time voting results for the great pizza debate",
        currentPage: 'tv',
        pageScripts: ['/js/tv-display.js']
    });
});

app.get('/admin', (req, res) => {
    res.render('admin', { 
        title: "Admin Panel - That's Amore Pizzeria",
        description: "Admin panel for managing voting results",
        currentPage: 'admin',
        pageScripts: ['/js/admin.js']
    });
});

// WebSocket event handlers
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send current voting data to new clients
    socket.emit('voting-data', votingData);
    
    // Handle votes
    socket.on('vote', (data) => {
        if (data.choice === 'ny') {
            votingData.nyVotes++;
        } else if (data.choice === 'chicago') {
            votingData.chicagoVotes++;
        }
        votingData.totalVotes = votingData.nyVotes + votingData.chicagoVotes;
        
        // Broadcast updated voting data to all connected clients
        io.emit('voting-update', votingData);
        
        console.log(`Vote received: ${data.choice}. NY: ${votingData.nyVotes}, Chicago: ${votingData.chicagoVotes}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 That's Amore Pizzeria website running on http://localhost:3000`);
    console.log(`🍕 The great pizza debate is ready!`);
    console.log(`📡 WebSocket server active for real-time voting!`);
});

module.exports = app;
