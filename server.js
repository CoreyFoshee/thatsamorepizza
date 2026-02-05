// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieSession = require('cookie-session');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// Check if we're running on Vercel (serverless environment)
const isVercel = process.env.VERCEL === '1';

// Socket.IO and HTTP server only for non-Vercel environments
let server, io;
if (!isVercel) {
    const http = require('http');
    const socketIo = require('socket.io');
    server = http.createServer(app);
    io = socketIo(server);
} else {
    // Create a dummy io object for Vercel to prevent errors
    io = {
        emit: () => {}, // No-op function
        on: () => {}, // No-op function
        engine: { clientsCount: 0 }
    };
}

const PORT = process.env.PORT || 3000;

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let supabaseClient = null; // For frontend (read-only)

if (supabaseUrl && supabaseServiceKey) {
    // Server-side client with service role key (full access)
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized (server-side)');
} else {
    console.warn('⚠️  Supabase credentials not found. Using file-based storage as fallback.');
}

if (supabaseUrl && supabaseAnonKey) {
    // Client for frontend (read-only)
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Data file paths (only used in non-Vercel environments and as fallback)
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

// Rate limiting: track votes per identifier (IP + sessionId) in the last minute
// Format: { identifier: [timestamp1, timestamp2, ...] }
const voteRateLimit = new Map();
const MAX_VOTES_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Clean up old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [identifier, timestamps] of voteRateLimit.entries()) {
        const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
        if (recentTimestamps.length === 0) {
            voteRateLimit.delete(identifier);
        } else {
            voteRateLimit.set(identifier, recentTimestamps);
        }
    }
}, 30000); // Clean up every 30 seconds

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
            // Merge the data, but preserve nested objects like hours
            adminData = { ...adminData, ...data };
            // If hours object exists in loaded data, merge it properly to preserve businessHours and holidayHours
            if (data.hours) {
                adminData.hours = {
                    ...adminData.hours,
                    ...data.hours,
                    // Preserve businessHours and holidayHours from defaults if not in loaded data
                    businessHours: data.hours.businessHours || adminData.hours.businessHours,
                    holidayHours: data.hours.holidayHours || adminData.hours.holidayHours
                };
            }
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

// ============================================
// Supabase Helper Functions
// ============================================

// In-memory cache for voting metrics (reduces Supabase calls from polling / repeated requests)
const VOTING_METRICS_CACHE_MS = 25 * 1000; // 25 seconds
let votingMetricsCache = null;
let votingMetricsCacheTime = 0;

// Restaurant Metrics Functions
async function getRestaurantMetrics() {
    if (!supabase) {
        // Fallback to in-memory data
        return {
            nyVotes: votingData.nyVotes,
            chicagoVotes: votingData.chicagoVotes,
            totalVotes: votingData.totalVotes,
            pizzasSold: adminData.tvControls.piesSold || 0
        };
    }
    
    const now = Date.now();
    if (votingMetricsCache && (now - votingMetricsCacheTime) < VOTING_METRICS_CACHE_MS) {
        return votingMetricsCache;
    }
    
    try {
        const { data, error } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (error) throw error;
        
        const result = {
            nyVotes: data.ny_votes || 0,
            chicagoVotes: data.chicago_votes || 0,
            totalVotes: data.total_votes || 0,
            pizzasSold: data.pizzas_sold || 0,
            nyLifetimeSales: data.ny_lifetime_sales || '',
            chicagoLifetimeSales: data.chicago_lifetime_sales || ''
        };
        votingMetricsCache = result;
        votingMetricsCacheTime = now;
        return result;
    } catch (error) {
        console.error('Error fetching restaurant metrics:', error);
        return {
            nyVotes: 0,
            chicagoVotes: 0,
            totalVotes: 0,
            pizzasSold: 0
        };
    }
}

async function recordVote(choice, sessionId, clientIp) {
    // Rate limiting check
    const identifier = `${clientIp || 'unknown'}_${sessionId}`;
    const now = Date.now();
    const recentVotes = voteRateLimit.get(identifier) || [];
    
    // Filter to only votes in the last minute
    const votesInLastMinute = recentVotes.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    
    if (votesInLastMinute.length >= MAX_VOTES_PER_MINUTE) {
        return { 
            success: false, 
            message: `Rate limit exceeded. Please wait a moment before voting again. (Max ${MAX_VOTES_PER_MINUTE} votes per minute)` 
        };
    }
    
    // Add current vote timestamp
    votesInLastMinute.push(now);
    voteRateLimit.set(identifier, votesInLastMinute);
    
    if (!supabase) {
        // Fallback to in-memory
        if (choice === 'ny') {
            votingData.nyVotes++;
        } else if (choice === 'chicago') {
            votingData.chicagoVotes++;
        }
        votingData.totalVotes = votingData.nyVotes + votingData.chicagoVotes;
        saveVotingData();
        return { success: true, data: votingData };
    }
    
    try {
        
        // Insert vote record
        const { data: insertedVote, error: insertError } = await supabase
            .from('vote_records')
            .insert({ choice, session_id: sessionId })
            .select();
        
        if (insertError) {
            console.error('Error inserting vote record:', insertError);
            throw insertError;
        }
        
        console.log('Vote record inserted successfully:', insertedVote);
        
        // Update metrics
        const { data: metrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (!metrics) throw new Error('Restaurant metrics not found');
        
        const updateData = {
            ny_votes: choice === 'ny' ? metrics.ny_votes + 1 : metrics.ny_votes,
            chicago_votes: choice === 'chicago' ? metrics.chicago_votes + 1 : metrics.chicago_votes
        };
        updateData.total_votes = updateData.ny_votes + updateData.chicago_votes;
        
        const { data: updated, error: updateError } = await supabase
            .from('restaurant_metrics')
            .update(updateData)
            .eq('id', metrics.id)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        votingMetricsCache = null; // Invalidate cache so next read gets fresh counts
        return {
            success: true,
            data: {
                nyVotes: updated.ny_votes,
                chicagoVotes: updated.chicago_votes,
                totalVotes: updated.total_votes
            }
        };
    } catch (error) {
        console.error('Error recording vote:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false, message: 'Error recording vote: ' + (error.message || error.toString()) };
    }
}

async function updatePizzasSold(count) {
    if (!supabase) {
        adminData.tvControls.piesSold = count;
        saveAdminData();
        return { success: true };
    }
    
    try {
        const { data: metrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (!metrics) throw new Error('Restaurant metrics not found');
        
        const { error } = await supabase
            .from('restaurant_metrics')
            .update({ pizzas_sold: count })
            .eq('id', metrics.id);
        
        if (error) throw error;
        votingMetricsCache = null;
        return { success: true };
    } catch (error) {
        console.error('Error updating pizzas sold:', error);
        return { success: false, message: 'Error updating pizzas sold' };
    }
}

async function updateLifetimeSales(nySales, chicagoSales) {
    if (!supabase) {
        // Fallback to file-based storage if needed
        return { success: false, message: 'Supabase required for lifetime sales' };
    }
    
    try {
        const { data: metrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (!metrics) throw new Error('Restaurant metrics not found');
        
        const updateData = {};
        if (nySales !== undefined) {
            updateData.ny_lifetime_sales = nySales;
        }
        if (chicagoSales !== undefined) {
            updateData.chicago_lifetime_sales = chicagoSales;
        }
        
        if (Object.keys(updateData).length === 0) {
            return { success: true };
        }
        
        const { error } = await supabase
            .from('restaurant_metrics')
            .update(updateData)
            .eq('id', metrics.id);
        
        if (error) throw error;
        votingMetricsCache = null;
        return { success: true };
    } catch (error) {
        console.error('Error updating lifetime sales:', error);
        return { success: false, message: 'Error updating lifetime sales' };
    }
}

async function resetVotes() {
    if (!supabase) {
        votingData.nyVotes = 0;
        votingData.chicagoVotes = 0;
        votingData.totalVotes = 0;
        votingData.sessionVotes.clear();
        saveVotingData();
        return { success: true };
    }
    
    try {
        const { data: metrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (!metrics) throw new Error('Restaurant metrics not found');
        
        const { error } = await supabase
            .from('restaurant_metrics')
            .update({
                ny_votes: 0,
                chicago_votes: 0,
                total_votes: 0,
                last_reset: new Date().toISOString()
            })
            .eq('id', metrics.id);
        
        if (error) throw error;
        
        // Clear vote records (optional - you might want to keep them for analytics)
        // await supabase.from('vote_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        return { success: true };
    } catch (error) {
        console.error('Error resetting votes:', error);
        return { success: false, message: 'Error resetting votes' };
    }
}

async function setVotes(nyVotes, chicagoVotes) {
    if (!supabase) {
        votingData.nyVotes = nyVotes;
        votingData.chicagoVotes = chicagoVotes;
        votingData.totalVotes = nyVotes + chicagoVotes;
        saveVotingData();
        return { success: true };
    }
    
    try {
        const { data: metrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        if (!metrics) throw new Error('Restaurant metrics not found');
        
        const { error } = await supabase
            .from('restaurant_metrics')
            .update({
                ny_votes: nyVotes,
                chicago_votes: chicagoVotes,
                total_votes: nyVotes + chicagoVotes,
                last_reset: new Date().toISOString()
            })
            .eq('id', metrics.id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error setting votes:', error);
        return { success: false, message: 'Error setting votes' };
    }
}

async function setPizzasSold(count) {
    return await updatePizzasSold(count);
}

// Restaurant Hours Functions
async function getRestaurantHours() {
    if (!supabase) {
        return adminData.hours;
    }
    
    try {
        const { data, error } = await supabase
            .from('restaurant_hours')
            .select('*')
            .limit(1)
            .single();
        
        if (error) throw error;
        
        // Convert database format to expected format
        return {
            header: data.header_text,
            footer: data.footer_text,
            businessHours: data.business_hours,
            holidayHours: data.holiday_hours,
            lastUpdated: data.updated_at
        };
    } catch (error) {
        console.error('Error fetching restaurant hours:', error);
        return adminData.hours; // Fallback
    }
}

async function updateRestaurantHours(header, footer, businessHours, holidayHours) {
    if (!supabase) {
        if (header !== undefined) adminData.hours.header = header;
        if (footer !== undefined) adminData.hours.footer = footer;
        if (businessHours !== undefined) adminData.hours.businessHours = businessHours;
        if (holidayHours !== undefined) adminData.hours.holidayHours = holidayHours;
        saveAdminData();
        return { success: true };
    }
    
    try {
        const { data: hours } = await supabase
            .from('restaurant_hours')
            .select('*')
            .limit(1)
            .single();
        
        if (!hours) throw new Error('Restaurant hours not found');
        
        const updateData = {};
        if (header !== undefined) updateData.header_text = header;
        if (footer !== undefined) updateData.footer_text = footer;
        if (businessHours !== undefined) updateData.business_hours = businessHours;
        if (holidayHours !== undefined) updateData.holiday_hours = holidayHours;
        
        const { error } = await supabase
            .from('restaurant_hours')
            .update(updateData)
            .eq('id', hours.id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating restaurant hours:', error);
        return { success: false, message: 'Error updating restaurant hours' };
    }
}

// Restaurant Status Functions
async function getRestaurantStatus() {
    if (!supabase) {
        return adminData.restaurantStatus;
    }
    
    try {
        const { data, error } = await supabase
            .from('restaurant_status')
            .select('*')
            .limit(1)
            .single();
        
        if (error) throw error;
        
        return {
            manualClosed: data.manual_closed,
            lastUpdated: data.last_updated
        };
    } catch (error) {
        console.error('Error fetching restaurant status:', error);
        return adminData.restaurantStatus; // Fallback
    }
}

async function updateRestaurantStatus(manualClosed) {
    if (!supabase) {
        adminData.restaurantStatus.manualClosed = manualClosed;
        adminData.restaurantStatus.lastUpdated = new Date().toISOString();
        saveAdminData();
        return { success: true };
    }
    
    try {
        const { data: status } = await supabase
            .from('restaurant_status')
            .select('*')
            .limit(1)
            .single();
        
        if (!status) throw new Error('Restaurant status not found');
        
        const { error } = await supabase
            .from('restaurant_status')
            .update({
                manual_closed: manualClosed,
                last_updated: new Date().toISOString()
            })
            .eq('id', status.id);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating restaurant status:', error);
        return { success: false, message: 'Error updating restaurant status' };
    }
}

// Scheduled Closures Functions
async function getScheduledClosures() {
    if (!supabase) {
        return adminData.scheduledClosures;
    }
    
    try {
        const { data, error } = await supabase
            .from('scheduled_closures')
            .select('*')
            .order('closure_date', { ascending: true });
        
        if (error) throw error;
        
        return data.map(closure => ({
            date: closure.closure_date,
            reason: closure.reason
        }));
    } catch (error) {
        console.error('Error fetching scheduled closures:', error);
        return adminData.scheduledClosures; // Fallback
    }
}

async function addScheduledClosure(date, reason) {
    if (!supabase) {
        const existingIndex = adminData.scheduledClosures.findIndex(c => c.date === date);
        if (existingIndex !== -1) {
            adminData.scheduledClosures[existingIndex] = { date, reason: reason || '' };
        } else {
            adminData.scheduledClosures.push({ date, reason: reason || '' });
        }
        adminData.scheduledClosures.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveAdminData();
        return { success: true };
    }
    
    try {
        const { error } = await supabase
            .from('scheduled_closures')
            .upsert({
                closure_date: date,
                reason: reason || null
            }, {
                onConflict: 'closure_date'
            });
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error adding scheduled closure:', error);
        return { success: false, message: 'Error adding scheduled closure' };
    }
}

async function deleteScheduledClosure(date) {
    if (!supabase) {
        adminData.scheduledClosures = adminData.scheduledClosures.filter(c => c.date !== date);
        saveAdminData();
        return { success: true };
    }
    
    try {
        const { error } = await supabase
            .from('scheduled_closures')
            .delete()
            .eq('closure_date', date);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting scheduled closure:', error);
        return { success: false, message: 'Error deleting scheduled closure' };
    }
}

// Helper function to add Supabase credentials and optional CDN URLs to render data
function addSupabaseToRender(data) {
    return {
        ...data,
        supabaseUrl: supabaseUrl || '',
        supabaseAnonKey: supabaseAnonKey || '',
        heroVideoUrl: process.env.HERO_VIDEO_URL || '' // S3/CloudFront URL for hero video (optional)
    };
}

// Load data on startup
loadVotingData();
loadAdminData();

// Migration function to migrate file-based data to Supabase
async function migrateToSupabase() {
    if (!supabase) {
        console.log('⚠️  Supabase not configured, skipping migration');
        return;
    }
    
    try {
        // Check if Supabase already has data
        const { data: existingMetrics } = await supabase
            .from('restaurant_metrics')
            .select('*')
            .limit(1)
            .single();
        
        // Only migrate if Supabase is empty and we have file data
        if (existingMetrics && (existingMetrics.ny_votes > 0 || existingMetrics.chicago_votes > 0 || existingMetrics.pizzas_sold > 0)) {
            console.log('✅ Supabase already has data, skipping migration');
            return;
        }
        
        console.log('🔄 Starting migration from file-based storage to Supabase...');
        
        // Migrate voting data
        if (votingData.nyVotes > 0 || votingData.chicagoVotes > 0) {
            const { error } = await supabase
                .from('restaurant_metrics')
                .update({
                    ny_votes: votingData.nyVotes,
                    chicago_votes: votingData.chicagoVotes,
                    total_votes: votingData.totalVotes,
                    pizzas_sold: adminData.tvControls.piesSold || 0
                })
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Update existing row
            
            if (error) throw error;
            console.log(`✅ Migrated votes: NY=${votingData.nyVotes}, Chicago=${votingData.chicagoVotes}, Pizzas Sold=${adminData.tvControls.piesSold || 0}`);
        }
        
        // Migrate restaurant hours
        if (adminData.hours) {
            const { error } = await supabase
                .from('restaurant_hours')
                .update({
                    header_text: adminData.hours.header || '',
                    footer_text: adminData.hours.footer || '',
                    business_hours: adminData.hours.businessHours || {},
                    holiday_hours: adminData.hours.holidayHours || []
                })
                .neq('id', '00000000-0000-0000-0000-000000000000');
            
            if (error) throw error;
            console.log('✅ Migrated restaurant hours');
        }
        
        // Migrate restaurant status
        if (adminData.restaurantStatus) {
            const { error } = await supabase
                .from('restaurant_status')
                .update({
                    manual_closed: adminData.restaurantStatus.manualClosed || false
                })
                .neq('id', '00000000-0000-0000-0000-000000000000');
            
            if (error) throw error;
            console.log(`✅ Migrated restaurant status: manualClosed=${adminData.restaurantStatus.manualClosed}`);
        }
        
        // Migrate scheduled closures
        if (adminData.scheduledClosures && adminData.scheduledClosures.length > 0) {
            for (const closure of adminData.scheduledClosures) {
                const { error } = await supabase
                    .from('scheduled_closures')
                    .upsert({
                        closure_date: closure.date,
                        reason: closure.reason || null
                    }, {
                        onConflict: 'closure_date'
                    });
                
                if (error) {
                    console.warn(`⚠️  Error migrating closure ${closure.date}:`, error);
                }
            }
            console.log(`✅ Migrated ${adminData.scheduledClosures.length} scheduled closures`);
        }
        
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Error during migration:', error);
        console.log('⚠️  Continuing with file-based storage as fallback');
    }
}

// Run migration on startup only when not on Vercel (on Vercel, cold starts run this per instance = huge Supabase usage)
if (!isVercel) {
    setTimeout(() => {
        migrateToSupabase();
    }, 2000);
}

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Use express-ejs-layouts
app.use(expressLayouts);

// Serve static files from public directory (no 304: long cache, no conditional responses)
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (using cookie-session for serverless compatibility)
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'thats-amore-secret-key-change-in-production'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false, // Set to false for now - Vercel handles HTTPS but cookies work better with secure: false initially
    sameSite: 'lax'
}));

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
    res.render('index', addSupabaseToRender({ 
        title: "That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Settle the great debate between Chicago Deep Dish and New York Thin Crust pizza. Authentic Italian pizza in Metairie, Louisiana.",
        currentPage: 'home',
        pageScripts: []
    }));
});

app.get('/menu', (req, res) => {
    res.render('menu', addSupabaseToRender({ 
        title: "Menu - That's Amore Pizzeria | Chicago vs New York Pizza in Metairie",
        description: "Explore our complete menu featuring both Chicago Deep Dish and New York Thin Crust pizza. From authentic Italian pasta to wings, sandwiches, and desserts.",
        currentPage: 'menu',
        pageScripts: []
    }));
});

app.get('/catering', (req, res) => {
    res.render('catering', addSupabaseToRender({ 
        title: "Catering - That's Amore Pizzeria | Corporate & Event Catering in Metairie",
        description: "Professional catering services for corporate events, parties, and special occasions. Pizza trays, pasta, appetizers, and complete meal packages available.",
        currentPage: 'catering',
        pageScripts: []
    }));
});



app.get('/franchise', (req, res) => {
    res.render('franchise', addSupabaseToRender({ 
        title: "Franchise - That's Amore Pizzeria | Own a Slice of Something Great",
        description: "Join the That's Amore family! Franchise opportunities available with comprehensive training, marketing support, and proven business model.",
        currentPage: 'franchise',
        pageScripts: []
    }));
});

app.get('/contact', (req, res) => {
    res.render('contact', addSupabaseToRender({ 
        title: "Contact - That's Amore Pizzeria | Visit Us in Metairie, Louisiana",
        description: "Contact That's Amore Pizzeria in Metairie, Louisiana. Visit us at 4441 West Metairie Ave or call (504) 454-5885 for orders and reservations.",
        currentPage: 'contact',
        pageScripts: []
    }));
});

app.get('/tv', (req, res) => {
    res.render('tv', addSupabaseToRender({ 
        title: "Live Voting Results - That's Amore Pizzeria",
        description: "Live real-time voting results for the great pizza debate",
        currentPage: 'tv',
        pageScripts: ['/js/tv-display.js'],
        layout: false
    }));
});

// Admin password
const ADMIN_PASSWORD = 'thatsamore';

// Authentication middleware
function requireAuth(req, res, next) {
    console.log('requireAuth check - session:', req.session ? 'exists' : 'missing');
    console.log('requireAuth check - authenticated:', req.session?.authenticated);
    
    if (req.session && req.session.authenticated === true) {
        return next();
    } else {
        // For API routes, return JSON error; for page routes, redirect to login
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        return res.redirect('/admin/login');
    }
}

// Login page
app.get('/admin/login', (req, res) => {
    // If already authenticated, redirect to admin
    if (req.session && req.session.authenticated === true) {
        return res.redirect('/admin');
    }
    res.render('admin-login', {
        title: "Admin Login - That's Amore Pizzeria",
        description: "Admin login",
        layout: false
    });
});

// Login handler
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    
    console.log('Login attempt - password received:', password ? 'yes' : 'no');
    console.log('Expected password:', ADMIN_PASSWORD);
    
    if (password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        console.log('Authentication successful, session set:', req.session);
        // Ensure session is saved before redirect
        res.redirect('/admin');
    } else {
        console.log('Authentication failed - incorrect password');
        res.render('admin-login', {
            title: "Admin Login - That's Amore Pizzeria",
            description: "Admin login",
            error: 'Incorrect password. Please try again.',
            layout: false
        });
    }
});

// Logout handler
app.post('/admin/logout', (req, res) => {
    req.session = null; // Clear session with cookie-session
    res.redirect('/admin/login');
});

// Protected admin page
app.get('/admin', requireAuth, (req, res) => {
    res.render('admin', addSupabaseToRender({ 
        title: "Admin Panel - That's Amore Pizzeria",
        description: "Admin panel for managing voting results",
        currentPage: 'admin',
        pageScripts: ['/js/admin.js'],
        layout: false
    }));
});

// Admin API endpoints (all protected)
app.post('/api/admin/reset-votes', requireAuth, async (req, res) => {
    try {
        const result = await resetVotes();
        
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message || 'Error resetting votes' });
        }
        
        // Get updated data for broadcast
        const metrics = await getRestaurantMetrics();
        const updateData = {
            nyVotes: metrics.nyVotes,
            chicagoVotes: metrics.chicagoVotes,
            totalVotes: metrics.totalVotes
        };
        
        // Broadcast reset to all connected clients
        io.emit('voting-update', updateData);
        io.emit('votes-reset', { message: 'Votes have been reset by admin' });
        
        res.json({ success: true, message: 'Votes reset successfully', data: updateData });
        console.log('Votes reset by admin');
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).json({ success: false, message: 'Error resetting votes' });
    }
});

app.post('/api/admin/set-votes', requireAuth, async (req, res) => {
    try {
        const { nyVotes, chicagoVotes } = req.body;
        
        if (typeof nyVotes !== 'number' || typeof chicagoVotes !== 'number' || 
            nyVotes < 0 || chicagoVotes < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid vote counts. Must be non-negative numbers.' 
            });
        }
        
        const result = await setVotes(nyVotes, chicagoVotes);
        
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message || 'Error setting votes' });
        }
        
        // Get updated data for broadcast
        const metrics = await getRestaurantMetrics();
        const updateData = {
            nyVotes: metrics.nyVotes,
            chicagoVotes: metrics.chicagoVotes,
            totalVotes: metrics.totalVotes
        };
        
        // Broadcast update to all connected clients
        io.emit('voting-update', updateData);
        io.emit('votes-manually-set', { message: 'Votes have been manually set by admin' });
        
        res.json({ success: true, message: 'Votes set successfully', data: updateData });
        console.log(`Votes manually set by admin: NY=${nyVotes}, Chicago=${chicagoVotes}`);
    } catch (error) {
        console.error('Error setting votes:', error);
        res.status(500).json({ success: false, message: 'Error setting votes' });
    }
});

// New Admin API endpoints
// Calculate current restaurant status based on hours, closures, and manual override
function calculateCurrentStatus(status, hours, closures) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
    
    // 1. Check manual override first
    if (status.manualClosed) {
        return {
            isOpen: false,
            reason: 'Manual Override',
            message: 'CLOSED (Manual Override)'
        };
    }
    
    // 2. Check scheduled closures
    const todayStr = today.toISOString().split('T')[0];
    const scheduledClosure = closures.find(c => c.date === todayStr);
    if (scheduledClosure) {
        return {
            isOpen: false,
            reason: scheduledClosure.reason || 'Scheduled Closure',
            message: `CLOSED (${scheduledClosure.reason || 'Scheduled Closure'})`
        };
    }
    
    // Helper function to calculate holiday dates
    function calculateHolidayDate(holidayName, year) {
        switch(holidayName) {
            case 'Easter':
                return getEasterDate(year);
            case 'Thanksgiving':
                return getThanksgivingDate(year);
            case 'Good Friday':
                const easter = getEasterDate(year);
                return new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before Easter
            case 'Easter Monday':
                const easterMon = getEasterDate(year);
                return new Date(easterMon.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day after Easter
            case 'Memorial Day':
                return getLastMondayOfMonth(year, 4); // May (month 4)
            case 'Labor Day':
                return getFirstMondayOfMonth(year, 8); // September (month 8)
            case 'Columbus Day':
                return getNthMondayOfMonth(year, 9, 2); // October (month 9), 2nd Monday
            case 'Presidents Day':
                return getNthMondayOfMonth(year, 1, 3); // February (month 1), 3rd Monday
            case 'Martin Luther King Jr. Day':
                return getNthMondayOfMonth(year, 0, 3); // January (month 0), 3rd Monday
            default:
                return null;
        }
    }
    
    function getEasterDate(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }
    
    function getThanksgivingDate(year) {
        const firstDay = new Date(year, 10, 1); // November 1st
        const firstThursday = new Date(year, 10, 1 + ((4 - firstDay.getDay() + 7) % 7));
        return new Date(year, 10, firstThursday.getDate() + 21); // 3 weeks later
    }
    
    function getFirstMondayOfMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const dayOfWeek = firstDay.getDay();
        const daysToAdd = (1 - dayOfWeek + 7) % 7; // Days to add to get to Monday
        return new Date(year, month, 1 + daysToAdd);
    }
    
    function getLastMondayOfMonth(year, month) {
        const lastDay = new Date(year, month + 1, 0); // Last day of month
        const dayOfWeek = lastDay.getDay();
        const daysToSubtract = (dayOfWeek - 1 + 7) % 7; // Days to subtract to get to Monday
        return new Date(year, month, lastDay.getDate() - daysToSubtract);
    }
    
    function getNthMondayOfMonth(year, month, n) {
        const firstMonday = getFirstMondayOfMonth(year, month);
        return new Date(year, month, firstMonday.getDate() + (n - 1) * 7);
    }
    
    // 3. Check holiday hours
    const holidayHours = hours.holidayHours || [];
    const todayHoliday = holidayHours.find(h => {
        if (h.isCalculated) {
            const calculatedDate = calculateHolidayDate(h.name, now.getFullYear());
            if (calculatedDate) {
                return calculatedDate.getMonth() === now.getMonth() && 
                       calculatedDate.getDate() === now.getDate();
            }
            return false;
        }
        return h.month === now.getMonth() + 1 && h.day === now.getDate();
    });
    
    if (todayHoliday) {
        return {
            isOpen: todayHoliday.open,
            reason: todayHoliday.name,
            message: todayHoliday.open ? `OPEN (${todayHoliday.name}: ${todayHoliday.hours})` : `CLOSED (${todayHoliday.name})`
        };
    }
    
    // 4. Check regular business hours
    const businessHours = hours.businessHours || {};
    // Convert object format (with numeric keys) to array if needed
    let businessHoursArray = Array.isArray(businessHours) ? businessHours : Object.values(businessHours);
    const todayHours = businessHoursArray.find(h => {
        // Convert day name to day index
        const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        return dayMap[h.day] === todayDay;
    }) || businessHours[todayDay]; // Fallback to direct key access
    
    if (!todayHours || !todayHours.open) {
        return {
            isOpen: false,
            reason: 'Closed Today',
            message: `CLOSED (${todayHours?.day || 'Not Open Today'})`
        };
    }
    
    // Parse hours string (e.g., "11:00 AM - 8:00 PM")
    const hoursMatch = todayHours.hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (hoursMatch) {
        const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = hoursMatch;
        
        let openTime = parseInt(openHour) * 60 + parseInt(openMin);
        if (openPeriod === 'PM' && openHour !== '12') openTime += 12 * 60;
        if (openPeriod === 'AM' && openHour === '12') openTime -= 12 * 60;
        
        let closeTime = parseInt(closeHour) * 60 + parseInt(closeMin);
        if (closePeriod === 'PM' && closeHour !== '12') closeTime += 12 * 60;
        if (closePeriod === 'AM' && closeHour === '12') closeTime -= 12 * 60;
        
        const isOpen = currentTime >= openTime && currentTime <= closeTime;
        
        return {
            isOpen: isOpen,
            reason: todayHours.day,
            message: isOpen ? `OPEN (${todayHours.hours})` : `CLOSED (${todayHours.hours})`
        };
    }
    
    // Fallback if hours can't be parsed
    return {
        isOpen: todayHours.open,
        reason: todayHours.day,
        message: todayHours.open ? `OPEN (${todayHours.hours})` : `CLOSED (${todayHours.hours})`
    };
}

app.get('/api/admin/data', requireAuth, async (req, res) => {
    try {
        const [metrics, hours, status, closures] = await Promise.all([
            getRestaurantMetrics(),
            getRestaurantHours(),
            getRestaurantStatus(),
            getScheduledClosures()
        ]);
        
        // Calculate actual current status
        const currentStatus = calculateCurrentStatus(status, hours, closures);
        
        res.json({
            success: true,
            data: {
                restaurantStatus: {
                    ...status,
                    currentStatus: currentStatus
                },
                hours: hours,
                scheduledClosures: closures,
                tvControls: {
                    piesSold: metrics.pizzasSold,
                    nyLifetimeSales: metrics.nyLifetimeSales,
                    chicagoLifetimeSales: metrics.chicagoLifetimeSales,
                    nyVotes: metrics.nyVotes,
                    chicagoVotes: metrics.chicagoVotes,
                    lastUpdated: new Date().toISOString()
                },
                votingData: {
                    nyVotes: metrics.nyVotes,
                    chicagoVotes: metrics.chicagoVotes,
                    totalVotes: metrics.totalVotes
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin data' });
    }
});

app.post('/api/admin/restaurant-status', requireAuth, async (req, res) => {
    try {
        const { manualClosed } = req.body;
        
        if (typeof manualClosed !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid manualClosed value. Must be boolean.' 
            });
        }
        
        const result = await updateRestaurantStatus(manualClosed);
        
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message || 'Error updating restaurant status' });
        }
        
        // Get updated status and calculate current status
        const [status, hours, closures] = await Promise.all([
            getRestaurantStatus(),
            getRestaurantHours(),
            getScheduledClosures()
        ]);
        
        const currentStatus = calculateCurrentStatus(status, hours, closures);
        
        res.json({ 
            success: true, 
            message: 'Restaurant status updated successfully', 
            data: {
                ...status,
                currentStatus: currentStatus
            }
        });
        console.log(`Restaurant status updated: manualClosed=${manualClosed}`);
    } catch (error) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ success: false, message: 'Error updating restaurant status' });
    }
});

app.post('/api/admin/hours', requireAuth, async (req, res) => {
    try {
        const { businessHours, holidayHours } = req.body;
        
        let businessHoursObj = undefined;
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
            
            // Convert array to object with numeric keys (0-6) for frontend compatibility
            businessHoursObj = {};
            businessHours.forEach((day, index) => {
                businessHoursObj[index] = day;
            });
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
        }
        
        const result = await updateRestaurantHours(undefined, undefined, businessHoursObj, holidayHours);
        
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message || 'Error updating hours' });
        }
        
        const hours = await getRestaurantHours();
        
        res.json({ 
            success: true, 
            message: 'Hours updated successfully', 
            data: hours 
        });
        console.log('Hours updated successfully');
    } catch (error) {
        console.error('Error updating hours:', error);
        res.status(500).json({ success: false, message: 'Error updating hours' });
    }
});

app.get('/api/hours', async (req, res) => {
    try {
        const hours = await getRestaurantHours();
        res.json({
            success: true,
            data: hours
        });
    } catch (error) {
        console.error('Error fetching hours:', error);
        res.status(500).json({ success: false, message: 'Error fetching hours' });
    }
});

app.post('/api/admin/closures', requireAuth, async (req, res) => {
    try {
        const { date, reason } = req.body;
        
        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date is required.' 
            });
        }
        
        const result = await addScheduledClosure(date, reason);
        
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message || 'Error adding closure' });
        }
        
        const closures = await getScheduledClosures();
        
        res.json({ 
            success: true, 
            message: 'Closure added successfully', 
            data: closures 
        });
        console.log(`Closure added/updated: ${date}`);
    } catch (error) {
        console.error('Error adding closure:', error);
        res.status(500).json({ success: false, message: 'Error adding closure' });
    }
});

app.delete('/api/admin/closures/:date', requireAuth, async (req, res) => {
    try {
        const { date } = req.params;
        
        const result = await deleteScheduledClosure(date);
        
        if (!result.success) {
            return res.status(404).json({ 
                success: false, 
                message: result.message || 'Closure not found' 
            });
        }
        
        const closures = await getScheduledClosures();
        
        res.json({ 
            success: true, 
            message: 'Closure deleted successfully', 
            data: closures 
        });
        console.log(`Closure deleted: ${date}`);
    } catch (error) {
        console.error('Error deleting closure:', error);
        res.status(500).json({ success: false, message: 'Error deleting closure' });
    }
});

// Catering menu endpoints removed - no longer needed

app.post('/api/admin/tv-controls', requireAuth, async (req, res) => {
    try {
        const { piesSold, nyVotes, chicagoVotes, nyLifetimeSales, chicagoLifetimeSales } = req.body;
        
        if (piesSold !== undefined) {
            if (typeof piesSold !== 'number' || piesSold < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid pies sold value. Must be non-negative number.' 
                });
            }
            const result = await updatePizzasSold(piesSold);
            if (!result.success) {
                return res.status(500).json({ success: false, message: result.message || 'Error updating pizzas sold' });
            }
        }
        
        if (nyLifetimeSales !== undefined || chicagoLifetimeSales !== undefined) {
            // Accept text values for lifetime sales (can be formatted like "$1,234" or "1,234 pizzas")
            if (nyLifetimeSales !== undefined && typeof nyLifetimeSales !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid NY lifetime sales value. Must be text.' 
                });
            }
            if (chicagoLifetimeSales !== undefined && typeof chicagoLifetimeSales !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid Chicago lifetime sales value. Must be text.' 
                });
            }
            const result = await updateLifetimeSales(nyLifetimeSales, chicagoLifetimeSales);
            if (!result.success) {
                return res.status(500).json({ success: false, message: result.message || 'Error updating lifetime sales' });
            }
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
            
            const currentMetrics = await getRestaurantMetrics();
            const newNyVotes = nyVotes !== undefined ? nyVotes : currentMetrics.nyVotes;
            const newChicagoVotes = chicagoVotes !== undefined ? chicagoVotes : currentMetrics.chicagoVotes;
            
            const result = await setVotes(newNyVotes, newChicagoVotes);
            if (!result.success) {
                return res.status(500).json({ success: false, message: result.message || 'Error updating votes' });
            }
            
            // Broadcast update to all connected clients
            const updatedMetrics = await getRestaurantMetrics();
            io.emit('voting-update', {
                nyVotes: updatedMetrics.nyVotes,
                chicagoVotes: updatedMetrics.chicagoVotes,
                totalVotes: updatedMetrics.totalVotes
            });
        }
        
        // Get updated metrics for response
        const metrics = await getRestaurantMetrics();
        
        // Emit admin update for TV controls
        io.emit('admin-update', {
            type: 'tv-controls',
            data: {
                piesSold: metrics.pizzasSold,
                nyVotes: metrics.nyVotes,
                chicagoVotes: metrics.chicagoVotes,
                lastUpdated: new Date().toISOString()
            }
        });
        
        res.json({ 
            success: true, 
            message: 'TV controls updated successfully', 
            data: {
                tvControls: {
                    piesSold: metrics.pizzasSold,
                    nyVotes: metrics.nyVotes,
                    chicagoVotes: metrics.chicagoVotes,
                    lastUpdated: new Date().toISOString()
                },
                votingData: {
                    nyVotes: metrics.nyVotes,
                    chicagoVotes: metrics.chicagoVotes,
                    totalVotes: metrics.totalVotes
                }
            }
        });
        console.log('TV controls updated successfully');
    } catch (error) {
        console.error('Error updating TV controls:', error);
        res.status(500).json({ success: false, message: 'Error updating TV controls' });
    }
});

app.get('/api/admin/voting-data', requireAuth, async (req, res) => {
    try {
        const metrics = await getRestaurantMetrics();
        res.json({
            success: true,
            data: {
                nyVotes: metrics.nyVotes,
                chicagoVotes: metrics.chicagoVotes,
                totalVotes: metrics.totalVotes
            }
        });
    } catch (error) {
        console.error('Error fetching voting data:', error);
        res.status(500).json({ success: false, message: 'Error fetching voting data' });
    }
});

// Fallback voting endpoint for environments without WebSocket support
app.post('/api/vote', async (req, res) => {
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
        
        // Get client IP for rate limiting
        const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        
        const result = await recordVote(choice, sessionId, clientIp);
        
        if (!result.success) {
            return res.json({ 
                success: false, 
                message: result.message || 'Error recording vote' 
            });
        }
        
        // Broadcast to WebSocket clients if available
        if (io.engine.clientsCount > 0) {
            io.emit('voting-update', result.data);
        }
        
        res.json({ 
            success: true, 
            message: 'Vote recorded successfully!',
            data: result.data
        });
        
        console.log(`Vote received via API: ${choice}. NY: ${result.data.nyVotes}, Chicago: ${result.data.chicagoVotes}`);
    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing vote' 
        });
    }
});

// Get current voting data
app.get('/api/voting-data', async (req, res) => {
    try {
        const metrics = await getRestaurantMetrics();
        res.json({
            success: true,
            data: {
                nyVotes: metrics.nyVotes,
                chicagoVotes: metrics.chicagoVotes,
                totalVotes: metrics.totalVotes,
                pizzasSold: metrics.pizzasSold,
                nyLifetimeSales: metrics.nyLifetimeSales,
                chicagoLifetimeSales: metrics.chicagoLifetimeSales
            }
        });
    } catch (error) {
        console.error('Error fetching voting data:', error);
        res.status(500).json({ success: false, message: 'Error fetching voting data' });
    }
});

// Debug endpoint to check vote records
app.get('/api/debug/vote-records', async (req, res) => {
    if (!supabase) {
        return res.json({ success: false, message: 'Supabase not configured' });
    }
    
    try {
        const { data, error } = await supabase
            .from('vote_records')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('Error fetching vote records:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
        
        res.json({
            success: true,
            count: data ? data.length : 0,
            records: data
        });
    } catch (error) {
        console.error('Error in vote records debug:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// WebSocket event handlers (only active in non-Vercel environments)
if (!isVercel) {
    io.on('connection', async (socket) => {
        console.log('New client connected:', socket.id);
        
        // Send current voting data to new clients
        try {
            const metrics = await getRestaurantMetrics();
            socket.emit('voting-data', {
                nyVotes: metrics.nyVotes,
                chicagoVotes: metrics.chicagoVotes,
                totalVotes: metrics.totalVotes
            });
        } catch (error) {
            console.error('Error sending initial voting data:', error);
            socket.emit('voting-data', votingData); // Fallback
        }
        
        // Handle votes
        socket.on('vote', async (data) => {
            const sessionId = data.sessionId;
            const clientIp = socket.handshake.address || socket.request.connection.remoteAddress || 'unknown';
            
            const result = await recordVote(data.choice, sessionId, clientIp);
            
            if (!result.success) {
                socket.emit('vote-error', { message: result.message || 'Error recording vote' });
                return;
            }
            
            // Broadcast updated voting data to all connected clients
            io.emit('voting-update', result.data);
            
            // Send success confirmation to the voter
            socket.emit('vote-success', { 
                choice: data.choice, 
                message: 'Vote recorded successfully!' 
            });
            
            console.log(`Vote received: ${data.choice}. NY: ${result.data.nyVotes}, Chicago: ${result.data.chicagoVotes}`);
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

// Add a note about Vercel limitations
if (isVercel) {
    console.log('⚠️  Running on Vercel - WebSocket connections may not persist between requests');
    console.log('⚠️  Voting data will reset when serverless functions restart');
    // Don't initialize Socket.IO on Vercel as it doesn't work in serverless
    // The io object will be undefined, which is handled in the code
} else {
    // Start server only in non-Vercel environments
    server.listen(PORT, () => {
        console.log(`🚀 That's Amore Pizzeria website running on http://localhost:${PORT}`);
        console.log(`🍕 The great pizza debate is ready!`);
        console.log(`📡 WebSocket server active for real-time voting!`);
    });
}

// Export app for Vercel serverless functions
module.exports = app;
