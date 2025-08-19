const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Check if we're running on Vercel (serverless environment)
const isVercel = process.env.VERCEL === '1';

// Data file path (only used in non-Vercel environments)
const DATA_FILE = path.join(__dirname, 'data', 'voting-data.json');

// Ensure data directory exists (only in non-Vercel environments)
if (!isVercel) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
}

// Load voting data from file or create default
let votingData = {
    nyVotes: 0,
    chicagoVotes: 0,
    totalVotes: 0,
    lastReset: new Date().toISOString(),
    sessionVotes: new Set() // Track session IDs that have voted
};

// Load data from file if it exists (only in non-Vercel environments)
function loadVotingData() {
    if (isVercel) {
        console.log('Running on Vercel - using in-memory storage only');
        return;
    }
    
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            votingData = { ...votingData, ...data };
            // Convert sessionVotes back to Set if it was stored as array
            if (Array.isArray(votingData.sessionVotes)) {
                votingData.sessionVotes = new Set(data.sessionVotes);
            } else {
                votingData.sessionVotes = new Set();
            }
            console.log('Voting data loaded from file');
        }
    } catch (error) {
        console.error('Error loading voting data:', error);
    }
}

// Save voting data to file (only in non-Vercel environments)
function saveVotingData() {
    if (isVercel) {
        console.log('Running on Vercel - skipping file save');
        return;
    }
    
    try {
        // Convert Set to Array for JSON serialization
        const dataToSave = {
            ...votingData,
            sessionVotes: Array.from(votingData.sessionVotes)
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
        console.log('Voting data saved to file');
    } catch (error) {
        console.error('Error saving voting data:', error);
    }
}

// Load data on startup
loadVotingData();

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
        pageScripts: ['/js/tv-display.js'],
        layout: false
    });
});

app.get('/admin', (req, res) => {
    res.render('admin', { 
        title: "Admin Panel - That's Amore Pizzeria",
        description: "Admin panel for managing voting results",
        currentPage: 'admin',
        pageScripts: ['/js/admin.js'],
        layout: false
    });
});

// Admin API endpoints
app.post('/api/admin/reset-votes', (req, res) => {
    try {
        votingData.nyVotes = 0;
        votingData.chicagoVotes = 0;
        votingData.totalVotes = 0;
        votingData.lastReset = new Date().toISOString();
        votingData.sessionVotes.clear();
        
        saveVotingData();
        
        // Broadcast reset to all connected clients
        io.emit('voting-update', votingData);
        io.emit('votes-reset', { message: 'Votes have been reset by admin' });
        
        res.json({ success: true, message: 'Votes reset successfully', data: votingData });
        console.log('Votes reset by admin');
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).json({ success: false, message: 'Error resetting votes' });
    }
});

app.post('/api/admin/set-votes', (req, res) => {
    try {
        const { nyVotes, chicagoVotes } = req.body;
        
        if (typeof nyVotes !== 'number' || typeof chicagoVotes !== 'number' || 
            nyVotes < 0 || chicagoVotes < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid vote counts. Must be non-negative numbers.' 
            });
        }
        
        votingData.nyVotes = nyVotes;
        votingData.chicagoVotes = chicagoVotes;
        votingData.totalVotes = nyVotes + chicagoVotes;
        votingData.lastReset = new Date().toISOString();
        
        saveVotingData();
        
        // Broadcast update to all connected clients
        io.emit('voting-update', votingData);
        io.emit('votes-manually-set', { message: 'Votes have been manually set by admin' });
        
        res.json({ success: true, message: 'Votes set successfully', data: votingData });
        console.log(`Votes manually set by admin: NY=${nyVotes}, Chicago=${chicagoVotes}`);
    } catch (error) {
        console.error('Error setting votes:', error);
        res.status(500).json({ success: false, message: 'Error setting votes' });
    }
});

app.get('/api/admin/voting-data', (req, res) => {
    res.json({
        success: true,
        data: {
            ...votingData,
            sessionVotes: Array.from(votingData.sessionVotes)
        }
    });
});

// Fallback voting endpoint for environments without WebSocket support
app.post('/api/vote', (req, res) => {
    try {
        const { choice, sessionId } = req.body;
        
        if (!choice || !sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing choice or sessionId' 
            });
        }
        
        if (choice !== 'ny' && choice !== 'chicago') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid choice. Must be "ny" or "chicago"' 
            });
        }
        
        // Check if this session has already voted
        if (votingData.sessionVotes.has(sessionId)) {
            return res.json({ 
                success: false, 
                message: 'You have already voted in this session' 
            });
        }
        
        // Record the vote
        if (choice === 'ny') {
            votingData.nyVotes++;
        } else if (choice === 'chicago') {
            votingData.chicagoVotes++;
        }
        
        votingData.totalVotes = votingData.nyVotes + votingData.chicagoVotes;
        votingData.sessionVotes.add(sessionId);
        
        // Save data to file (only in non-Vercel environments)
        saveVotingData();
        
        // Broadcast to WebSocket clients if available
        if (io.engine.clientsCount > 0) {
            io.emit('voting-update', votingData);
        }
        
        res.json({ 
            success: true, 
            message: 'Vote recorded successfully!',
            data: votingData
        });
        
        console.log(`Vote received via API: ${choice}. NY: ${votingData.nyVotes}, Chicago: ${votingData.chicagoVotes}`);
    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing vote' 
        });
    }
});

// Get current voting data
app.get('/api/voting-data', (req, res) => {
    res.json({
        success: true,
        data: {
            nyVotes: votingData.nyVotes,
            chicagoVotes: votingData.chicagoVotes,
            totalVotes: votingData.totalVotes
        }
    });
});

// WebSocket event handlers
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send current voting data to new clients
    socket.emit('voting-data', votingData);
    
    // Handle votes
    socket.on('vote', (data) => {
        const sessionId = data.sessionId;
        
        // Check if this session has already voted
        if (votingData.sessionVotes.has(sessionId)) {
            socket.emit('vote-error', { message: 'You have already voted in this session' });
            return;
        }
        
        // Record the vote
        if (data.choice === 'ny') {
            votingData.nyVotes++;
        } else if (data.choice === 'chicago') {
            votingData.chicagoVotes++;
        }
        
        votingData.totalVotes = votingData.nyVotes + votingData.chicagoVotes;
        votingData.sessionVotes.add(sessionId);
        
        // Save data to file (only in non-Vercel environments)
        saveVotingData();
        
        // Broadcast updated voting data to all connected clients
        io.emit('voting-update', votingData);
        
        // Send success confirmation to the voter
        socket.emit('vote-success', { 
            choice: data.choice, 
            message: 'Vote recorded successfully!' 
        });
        
        console.log(`Vote received: ${data.choice}. NY: ${votingData.nyVotes}, Chicago: ${votingData.chicagoVotes}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Add a note about Vercel limitations
if (isVercel) {
    console.log('⚠️  Running on Vercel - WebSocket connections may not persist between requests');
    console.log('⚠️  Voting data will reset when serverless functions restart');
}

// Start server
server.listen(PORT, () => {
    console.log(`🚀 That's Amore Pizzeria website running on http://localhost:3000`);
    console.log(`🍕 The great pizza debate is ready!`);
    console.log(`📡 WebSocket server active for real-time voting!`);
});

module.exports = app;
