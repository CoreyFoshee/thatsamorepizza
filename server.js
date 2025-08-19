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

// Data file paths (only used in non-Vercel environments)
const DATA_FILE = path.join(__dirname, 'data', 'voting-data.json');
const ADMIN_DATA_FILE = path.join(__dirname, 'data', 'admin-data.json');

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

// Load admin data from file or create default
let adminData = {
    restaurantStatus: {
        manualClosed: false,
        lastUpdated: new Date().toISOString()
    },
    hours: {
        header: "Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM",
        footer: "Open Daily | Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM",
        businessHours: {
            0: { day: 'Sunday', hours: '11:00 AM - 8:00 PM', open: true },
            1: { day: 'Monday', hours: 'Closed', open: false },
            2: { day: 'Tuesday', hours: '11:00 AM - 8:00 PM', open: true },
            3: { day: 'Wednesday', hours: '11:00 AM - 8:00 PM', open: true },
            4: { day: 'Thursday', hours: '11:00 AM - 8:00 PM', open: true },
            5: { day: 'Friday', hours: '11:00 AM - 9:00 PM', open: true },
            6: { day: 'Saturday', hours: '11:00 AM - 9:00 PM', open: true }
        },
        holidayHours: [
            { name: 'Christmas Day', month: 12, day: 25, hours: 'Closed', open: false },
            { name: 'Christmas Eve', month: 12, day: 24, hours: '11:00 AM - 3:00 PM', open: true },
            { name: 'Easter', month: 0, day: 0, hours: 'Closed', open: false },
            { name: 'Thanksgiving', month: 10, day: 0, hours: 'Closed', open: false, isCalculated: true }
        ],
        lastUpdated: new Date().toISOString()
    },
    scheduledClosures: [],
    cateringMenu: [
        { id: '1', name: 'Homemade Lasagna', smallPrice: 70.00, largePrice: 105.00, singlePrice: null },
        { id: '2', name: 'Chicken Alfredo Pasta', smallPrice: 60.00, largePrice: 85.00, singlePrice: null },
        { id: '3', name: 'Shrimp Alfredo Pasta', smallPrice: 65.00, largePrice: 95.00, singlePrice: null },
        { id: '4', name: 'Chicken Tenders', smallPrice: null, largePrice: null, singlePrice: 25.00 },
        { id: '5', name: 'Chicken Wings with Sauce', smallPrice: null, largePrice: null, singlePrice: 50.00 },
        { id: '6', name: 'Caesar Salad', smallPrice: 25.00, largePrice: 45.00, singlePrice: null },
        { id: '7', name: 'Italian Salad', smallPrice: 35.00, largePrice: 55.00, singlePrice: null },
        { id: '8', name: 'House Salad', smallPrice: 25.00, largePrice: 45.00, singlePrice: null },
        { id: '9', name: 'Muffaletta', smallPrice: null, largePrice: null, singlePrice: 75.00 },
        { id: '10', name: 'Spaghetti & Meatballs', smallPrice: null, largePrice: null, singlePrice: 40.00 },
        { id: '11', name: 'Fried Ravioli with Marinara', smallPrice: null, largePrice: null, singlePrice: 40.00 },
        { id: '12', name: 'Catfish Strips', smallPrice: null, largePrice: null, singlePrice: 80.00 },
        { id: '13', name: 'Waffle Fries', smallPrice: null, largePrice: null, singlePrice: 15.00 },
        { id: '14', name: 'Pizza Beignets with Dipping Sauce', smallPrice: null, largePrice: null, singlePrice: 30.00 },
        { id: '15', name: 'Gallon Iced Tea', smallPrice: null, largePrice: null, singlePrice: 8.00 }
    ],
    tvControls: {
        piesSold: 0,
        nyVotes: 0,
        chicagoVotes: 0,
        lastUpdated: new Date().toISOString()
    },
    lastUpdated: new Date().toISOString()
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

function loadAdminData() {
    if (isVercel) {
        console.log('Running on Vercel - using in-memory admin storage only');
        return;
    }
    
    try {
        if (fs.existsSync(ADMIN_DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(ADMIN_DATA_FILE, 'utf8'));
            adminData = { ...adminData, ...data };
            console.log('Admin data loaded from file');
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
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

function saveAdminData() {
    if (isVercel) {
        console.log('Running on Vercel - skipping admin file save');
        return;
    }
    
    try {
        fs.writeFileSync(ADMIN_DATA_FILE, JSON.stringify(adminData, null, 2));
        console.log('Admin data saved to file');
    } catch (error) {
        console.error('Error saving admin data:', error);
    }
}

// Load data on startup
loadVotingData();
loadAdminData();

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

// New Admin API endpoints
app.get('/api/admin/data', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                restaurantStatus: adminData.restaurantStatus,
                hours: adminData.hours,
                scheduledClosures: adminData.scheduledClosures,
                cateringMenu: adminData.cateringMenu,
                tvControls: adminData.tvControls,
                votingData: {
                    nyVotes: votingData.nyVotes,
                    chicagoVotes: votingData.chicagoVotes,
                    totalVotes: votingData.totalVotes
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin data' });
    }
});

app.post('/api/admin/restaurant-status', (req, res) => {
    try {
        const { manualClosed } = req.body;
        
        if (typeof manualClosed !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid manualClosed value. Must be boolean.' 
            });
        }
        
        adminData.restaurantStatus.manualClosed = manualClosed;
        adminData.restaurantStatus.lastUpdated = new Date().toISOString();
        adminData.lastUpdated = new Date().toISOString();
        
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Restaurant status updated successfully', 
            data: adminData.restaurantStatus 
        });
        console.log(`Restaurant status updated: manualClosed=${manualClosed}`);
    } catch (error) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ success: false, message: 'Error updating restaurant status' });
    }
});

app.post('/api/admin/hours', (req, res) => {
    try {
        const { header, footer, businessHours, holidayHours } = req.body;
        
        if (header !== undefined) {
            if (typeof header !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid header hours. Must be a string.' 
                });
            }
            adminData.hours.header = header;
        }
        
        if (footer !== undefined) {
            if (typeof footer !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid footer hours. Must be a string.' 
                });
            }
            adminData.hours.footer = footer;
        }
        
        if (businessHours !== undefined) {
            if (!Array.isArray(businessHours) || businessHours.length !== 7) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid business hours. Must be an array of 7 days.' 
                });
            }
            
            // Validate each day's hours
            for (let i = 0; i < 7; i++) {
                const day = businessHours[i];
                if (!day || typeof day.day !== 'string' || typeof day.hours !== 'string' || typeof day.open !== 'boolean') {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Invalid business hours for day ${i}. Each day must have day, hours, and open properties.` 
                    });
                }
            }
            
            adminData.hours.businessHours = businessHours;
        }
        
        if (holidayHours !== undefined) {
            if (!Array.isArray(holidayHours)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid holiday hours. Must be an array.' 
                });
            }
            
            // Validate holiday hours structure
            for (const holiday of holidayHours) {
                if (!holiday.name || typeof holiday.name !== 'string' || 
                    typeof holiday.month !== 'number' || typeof holiday.day !== 'number' ||
                    typeof holiday.hours !== 'string' || typeof holiday.open !== 'boolean') {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid holiday hours structure. Each holiday must have name, month, day, hours, and open properties.' 
                    });
                }
            }
            
            adminData.hours.holidayHours = holidayHours;
        }
        
        adminData.hours.lastUpdated = new Date().toISOString();
        adminData.lastUpdated = new Date().toISOString();
        
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Hours updated successfully', 
            data: adminData.hours 
        });
        console.log('Hours updated successfully');
    } catch (error) {
        console.error('Error updating hours:', error);
        res.status(500).json({ success: false, message: 'Error updating hours' });
    }
});

app.get('/api/hours', (req, res) => {
    try {
        res.json({
            success: true,
            data: adminData.hours
        });
    } catch (error) {
        console.error('Error fetching hours:', error);
        res.status(500).json({ success: false, message: 'Error fetching hours' });
    }
});

app.post('/api/admin/closures', (req, res) => {
    try {
        const { date, reason } = req.body;
        
        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date is required.' 
            });
        }
        
        // Check if closure already exists
        const existingIndex = adminData.scheduledClosures.findIndex(c => c.date === date);
        if (existingIndex !== -1) {
            // Update existing closure
            adminData.scheduledClosures[existingIndex] = { date, reason: reason || '' };
        } else {
            // Add new closure
            adminData.scheduledClosures.push({ date, reason: reason || '' });
        }
        
        // Sort closures by date
        adminData.scheduledClosures.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        adminData.lastUpdated = new Date().toISOString();
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Closure added successfully', 
            data: adminData.scheduledClosures 
        });
        console.log(`Closure added/updated: ${date}`);
    } catch (error) {
        console.error('Error adding closure:', error);
        res.status(500).json({ success: false, message: 'Error adding closure' });
    }
});

app.delete('/api/admin/closures/:date', (req, res) => {
    try {
        const { date } = req.params;
        
        const initialLength = adminData.scheduledClosures.length;
        adminData.scheduledClosures = adminData.scheduledClosures.filter(c => c.date !== date);
        
        if (adminData.scheduledClosures.length === initialLength) {
            return res.status(404).json({ 
                success: false, 
                message: 'Closure not found' 
            });
        }
        
        adminData.lastUpdated = new Date().toISOString();
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Closure deleted successfully', 
            data: adminData.scheduledClosures 
        });
        console.log(`Closure deleted: ${date}`);
    } catch (error) {
        console.error('Error deleting closure:', error);
        res.status(500).json({ success: false, message: 'Error deleting closure' });
    }
});

app.post('/api/admin/catering-menu', (req, res) => {
    try {
        const { menu } = req.body;
        
        if (!Array.isArray(menu)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid menu data. Must be an array.' 
            });
        }
        
        // Process menu items
        adminData.cateringMenu = menu.map(item => ({
            id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || '',
            smallPrice: item.smallPrice || null,
            largePrice: item.largePrice || null,
            singlePrice: item.singlePrice || null
        }));
        
        adminData.lastUpdated = new Date().toISOString();
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Catering menu updated successfully', 
            data: adminData.cateringMenu 
        });
        console.log('Catering menu updated successfully');
    } catch (error) {
        console.error('Error updating catering menu:', error);
        res.status(500).json({ success: false, message: 'Error updating catering menu' });
    }
});

app.delete('/api/admin/catering-menu/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const initialLength = adminData.cateringMenu.length;
        adminData.cateringMenu = adminData.cateringMenu.filter(item => item.id !== id);
        
        if (adminData.cateringMenu.length === initialLength) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }
        
        adminData.lastUpdated = new Date().toISOString();
        saveAdminData();
        
        res.json({ 
            success: true, 
            message: 'Menu item deleted successfully', 
            data: adminData.cateringMenu 
        });
        console.log(`Menu item deleted: ${id}`);
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, message: 'Error deleting menu item' });
    }
});

app.post('/api/admin/tv-controls', (req, res) => {
    try {
        const { piesSold, nyVotes, chicagoVotes } = req.body;
        
        if (piesSold !== undefined) {
            if (typeof piesSold !== 'number' || piesSold < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid pies sold value. Must be non-negative number.' 
                });
            }
            adminData.tvControls.piesSold = piesSold;
        }
        
        if (nyVotes !== undefined || chicagoVotes !== undefined) {
            if (nyVotes !== undefined && (typeof nyVotes !== 'number' || nyVotes < 0)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid NY votes value. Must be non-negative number.' 
                });
            }
            if (chicagoVotes !== undefined && (typeof chicagoVotes !== 'number' || chicagoVotes < 0)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid Chicago votes value. Must be non-negative number.' 
                });
            }
            
            if (nyVotes !== undefined) {
                adminData.tvControls.nyVotes = nyVotes;
                votingData.nyVotes = nyVotes;
            }
            if (chicagoVotes !== undefined) {
                adminData.tvControls.chicagoVotes = chicagoVotes;
                votingData.chicagoVotes = chicagoVotes;
            }
            
            votingData.totalVotes = votingData.nyVotes + votingData.chicagoVotes;
            saveVotingData();
            
            // Broadcast update to all connected clients
            io.emit('voting-update', votingData);
        }
        
        adminData.tvControls.lastUpdated = new Date().toISOString();
        adminData.lastUpdated = new Date().toISOString();
        saveAdminData();
        
        // Emit admin update for TV controls
        io.emit('admin-update', {
            type: 'tv-controls',
            data: adminData.tvControls
        });
        
        res.json({ 
            success: true, 
            message: 'TV controls updated successfully', 
            data: {
                tvControls: adminData.tvControls,
                votingData: {
                    nyVotes: votingData.nyVotes,
                    chicagoVotes: votingData.chicagoVotes,
                    totalVotes: votingData.totalVotes
                }
            }
        });
        console.log('TV controls updated successfully');
    } catch (error) {
        console.error('Error updating TV controls:', error);
        res.status(500).json({ success: false, message: 'Error updating TV controls' });
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
