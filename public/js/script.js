// That's Amore Pizzeria - Interactive JavaScript

// Initialize Supabase client for frontend (read-only)
let supabaseClient = null;
if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined') {
    // Supabase will be loaded from CDN or configured via window object
    // We'll check for it in initPizzaPoll
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initTypewriter();
    initScrollAnimations();
    initCountUpAnimations();
    initFloatingOrderButton();
    initParallaxEffects();
    initFormHandling();
    initMobileMenu();
    initSmoothScrolling();
    initPizzaPoll(); // Initialize the pizza style poll
    initVideoBackground(); // Initialize video background
});

// Pizza Style Poll functionality with Supabase Realtime and WebSocket fallback
function initPizzaPoll() {
    // Get poll elements
    const nyVoteBtn = document.querySelector('.vote-btn-ny');
    const chicagoVoteBtn = document.querySelector('.vote-btn-chicago');
    const nyVotes = document.getElementById('ny-votes');
    const chicagoVotes = document.getElementById('chicago-votes');
    const nyProgress = document.getElementById('ny-progress');
    const chicagoProgress = document.getElementById('chicago-progress');
    const nyPercentage = document.getElementById('ny-percentage');
    const chicagoPercentage = document.getElementById('chicago-percentage');
    const totalVotes = document.getElementById('total-votes');
    
    // Initialize Socket.io connection (fallback)
    const socket = io();
    
    // Initialize Supabase client if available
    let supabase = null;
    if (window.supabase && window.supabaseUrl && window.supabaseAnonKey) {
        try {
            supabase = window.supabase.createClient(window.supabaseUrl, window.supabaseAnonKey);
            console.log('✅ Supabase client initialized for realtime updates');
        } catch (error) {
            console.warn('⚠️  Failed to initialize Supabase client:', error);
        }
    }
    
    // Session management
    let sessionId = localStorage.getItem('pizzaPollSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('pizzaPollSessionId', sessionId);
    }
    
    let hasVoted = false;
    let useWebSocket = true; // Default to WebSocket, fallback to API
    
    // Current voting data
    let currentVotes = { nyVotes: 0, chicagoVotes: 0, totalVotes: 0 };
    
    // Update display with voting data
    function updatePollDisplay(data) {
        if (!data) return;
        
        // Handle both old format (nyVotes, chicagoVotes, totalVotes) and new format
        const nyVotesCount = data.nyVotes || data.ny || 0;
        const chicagoVotesCount = data.chicagoVotes || data.chicago || 0;
        const totalVotesCount = data.totalVotes || data.total || (nyVotesCount + chicagoVotesCount);
        
        currentVotes = {
            nyVotes: nyVotesCount,
            chicagoVotes: chicagoVotesCount,
            totalVotes: totalVotesCount
        };
        
        const nyPercent = totalVotesCount > 0 ? Math.round((nyVotesCount / totalVotesCount) * 100) : 0;
        const chicagoPercent = totalVotesCount > 0 ? Math.round((chicagoVotesCount / totalVotesCount) * 100) : 0;
        
        // Update vote counts
        if (nyVotes) nyVotes.textContent = nyVotesCount;
        if (chicagoVotes) chicagoVotes.textContent = chicagoVotesCount;
        if (totalVotes) totalVotes.textContent = totalVotesCount;
        
        // Update percentages
        if (nyPercentage) nyPercentage.textContent = nyPercent + '%';
        if (chicagoPercentage) chicagoPercentage.textContent = chicagoPercent + '%';
        
        // Update progress bars with animation
        if (nyProgress) {
            nyProgress.style.transition = 'width 0.8s ease-in-out';
            nyProgress.style.width = nyPercent + '%';
        }
        if (chicagoProgress) {
            chicagoProgress.style.transition = 'width 0.8s ease-in-out';
            chicagoProgress.style.width = chicagoPercent + '%';
        }
    }
    
    // Load initial voting data
    async function loadInitialVotes() {
        try {
            const response = await fetch('/api/voting-data');
            const result = await response.json();
            if (result.success && result.data) {
                updatePollDisplay(result.data);
            }
        } catch (error) {
            console.error('Error loading initial votes:', error);
        }
    }
    
    // Initialize Supabase Realtime subscription
    if (supabase) {
        try {
            const channel = supabase
                .channel('restaurant-metrics-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'restaurant_metrics'
                }, (payload) => {
                    console.log('Received Supabase Realtime update:', payload);
                    if (payload.new) {
                        updatePollDisplay({
                            nyVotes: payload.new.ny_votes,
                            chicagoVotes: payload.new.chicago_votes,
                            totalVotes: payload.new.total_votes
                        });
                    }
                })
                .subscribe();
            
            console.log('✅ Supabase Realtime subscription active');
        } catch (error) {
            console.warn('⚠️  Failed to set up Supabase Realtime subscription:', error);
        }
    }
    
    // Load initial data
    loadInitialVotes();
    
    // Show vote confirmation
    function showVoteConfirmation(style, emoji) {
        // Create confirmation message
        const confirmation = document.createElement('div');
        confirmation.className = 'vote-confirmation fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-green-500 rounded-lg px-6 py-4 shadow-lg z-50';
        confirmation.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-2xl">${emoji}</div>
                <div>
                    <div class="font-bold text-green-600">Vote Cast!</div>
                    <div class="text-sm text-gray-600">You voted for ${style}</div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(confirmation);
        
        // Animate in
        setTimeout(() => {
            confirmation.style.opacity = '1';
            confirmation.style.transform = 'translate(-50%, 0) scale(1)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            confirmation.style.opacity = '0';
            confirmation.style.transform = 'translate(-50%, 0) scale(0.8)';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 300);
        }, 3000);
    }
    
    // Show vote error
    function showVoteError(message) {
        // Create error message
        const error = document.createElement('div');
        error.className = 'vote-error fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-red-500 rounded-lg px-6 py-4 shadow-lg z-50';
        error.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-2xl">⚠️</div>
                <div>
                    <div class="font-bold text-red-600">Vote Error</div>
                    <div class="text-sm text-gray-600">${message}</div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(error);
        
        // Animate in
        setTimeout(() => {
            error.style.opacity = '1';
            error.style.transform = 'translate(-50%, 0) scale(1)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            error.style.opacity = '0';
            error.style.transform = 'translate(-50%, 0) scale(0.8)';
            setTimeout(() => {
                if (error.parentNode) {
                    error.parentNode.removeChild(error);
                }
            }, 300);
        }, 3000);
    }
    
    // NY Style vote button
    if (nyVoteBtn) {
        nyVoteBtn.addEventListener('click', async function() {
            if (hasVoted) {
                showVoteError('You have already voted in this session');
                return;
            }
            
            try {
                if (useWebSocket && socket && socket.connected) {
                    // Send vote to server via WebSocket with session ID
                    socket.emit('vote', { choice: 'ny', sessionId: sessionId });
                } else {
                    // Fallback to API endpoint
                    const response = await fetch('/api/vote', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ choice: 'ny', sessionId: sessionId })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        updatePollDisplay(result.data);
                        showVoteConfirmation('NY Style', '🗽');
                    } else {
                        showVoteError(result.message);
                        return;
                    }
                }
                
                hasVoted = true;
                
                // Disable both buttons after voting
                nyVoteBtn.disabled = true;
                chicagoVoteBtn.disabled = true;
                nyVoteBtn.classList.add('opacity-50', 'cursor-not-allowed');
                chicagoVoteBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } catch (error) {
                console.error('Error casting vote:', error);
                showVoteError('Error casting vote. Please try again.');
            }
        });
    }
    
    // Chicago Style vote button
    if (chicagoVoteBtn) {
        chicagoVoteBtn.addEventListener('click', async function() {
            if (hasVoted) {
                showVoteError('You have already voted in this session');
                return;
            }
            
            try {
                if (useWebSocket && socket && socket.connected) {
                    // Send vote to server via WebSocket with session ID
                    socket.emit('vote', { choice: 'chicago', sessionId: sessionId });
                } else {
                    // Fallback to API endpoint
                    const response = await fetch('/api/vote', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ choice: 'chicago', sessionId: sessionId })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        updatePollDisplay(result.data);
                        showVoteConfirmation('Chicago Style', '🏙️');
                    } else {
                        showVoteError(result.message);
                        return;
                    }
                }
                
                hasVoted = true;
                
                // Disable both buttons after voting
                nyVoteBtn.disabled = true;
                chicagoVoteBtn.disabled = true;
                nyVoteBtn.classList.add('opacity-50', 'cursor-not-allowed');
                chicagoVoteBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } catch (error) {
                console.error('Error casting vote:', error);
                showVoteError('Error casting vote. Please try again.');
            }
        });
    }
    
    // WebSocket event handlers
    socket.on('voting-data', (data) => {
        console.log('Received initial voting data:', data);
        updatePollDisplay(data);
    });
    
    socket.on('voting-update', (data) => {
        console.log('Received voting update:', data);
        updatePollDisplay(data);
    });
    
    // Handle vote success
    socket.on('vote-success', (data) => {
        console.log('Vote recorded successfully:', data);
        if (data.choice === 'ny') {
            showVoteConfirmation('NY Style', '🗽');
        } else if (data.choice === 'chicago') {
            showVoteConfirmation('Chicago Style', '🏙️');
        }
    });
    
    // Handle vote errors
    socket.on('vote-error', (data) => {
        console.log('Vote error:', data);
        showVoteError(data.message);
        // Re-enable voting if there was an error
        hasVoted = false;
        if (nyVoteBtn) {
            nyVoteBtn.disabled = false;
            nyVoteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (chicagoVoteBtn) {
            chicagoVoteBtn.disabled = false;
            chicagoVoteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        // Fallback to local storage if WebSocket fails
        const localVotes = JSON.parse(localStorage.getItem('pizzaPollVotes')) || { ny: 0, chicago: 0 };
        updatePollDisplay({
            nyVotes: localVotes.ny,
            chicagoVotes: localVotes.chicago,
            totalVotes: localVotes.ny + localVotes.chicago
        });
    });
}

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove background on scroll
        if (scrollTop > 100) {
            navbar.classList.add('bg-white/95', 'shadow-lg');
        } else {
            navbar.classList.remove('bg-white/95', 'shadow-lg');
        }
        
        // Hide/show navbar on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Typewriter effect for hero text - Updated for the debate theme
function initTypewriter() {
    const typewriterText = document.querySelector('.typewriter-text');
    if (!typewriterText) return;
    
    const texts = [
        "Chicago Deep Dish vs New York Thin Crust",
        "The Ultimate Pizza Showdown",
        "Choose Your Side or Try Both",
        "Where the Great Debate Ends"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = 80; // Slightly faster for better engagement
        
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2500; // Longer pause at end to read the message
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 800; // Pause before next text
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start the typewriter effect
    setTimeout(typeWriter, 1000);
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Add staggered animations for menu cards
                if (entry.target.classList.contains('menu-card')) {
                    const delay = entry.target.getAttribute('data-aos-delay') || 0;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, delay);
                }
                
                // Add special animation for battle elements
                if (entry.target.classList.contains('battle-element')) {
                    entry.target.style.animation = 'battle 2s ease-in-out infinite';
                }
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Count-up animation for franchise stats
function initCountUpAnimations() {
    const countElements = document.querySelectorAll('[data-count]');
    
    const countObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalCount = parseInt(target.getAttribute('data-count'));
                const duration = 2000; // 2 seconds
                const increment = finalCount / (duration / 16); // 60fps
                let currentCount = 0;
                
                const timer = setInterval(() => {
                    currentCount += increment;
                    if (currentCount >= finalCount) {
                        currentCount = finalCount;
                        clearInterval(timer);
                    }
                    target.textContent = Math.floor(currentCount);
                }, 16);
                
                countObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    countElements.forEach(el => countObserver.observe(el));
}

// Floating order button
function initFloatingOrderButton() {
    const floatingButton = document.getElementById('floating-order');
    if (!floatingButton) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            floatingButton.classList.add('visible');
        } else {
            floatingButton.classList.remove('visible');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Parallax effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.animate-float');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${rate * speed}px)`;
        });
    });
}

// Form handling
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                submitBtn.textContent = 'Sent Successfully!';
                submitBtn.classList.add('bg-green-600');
                
                // Reset form after delay
                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-green-600');
                }, 2000);
            }, 1500);
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.style.animation = 'slideDown 0.3s ease-out';
        } else {
            mobileMenu.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced scroll effects
function initEnhancedScrollEffects() {
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrolled >= sectionTop - window.innerHeight * 0.5 && 
                scrolled < sectionTop + sectionHeight - window.innerHeight * 0.5) {
                
                // Add active class to current section
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('text-primary');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('text-primary');
                    }
                });
            }
        });
    });
}

// Initialize enhanced scroll effects
initEnhancedScrollEffects();

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to menu cards
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .btn-primary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add special effects for battle elements
    const battleElements = document.querySelectorAll('.battle-element');
    battleElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.animation = 'battle 1s ease-in-out infinite';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.animation = 'battle 2s ease-in-out infinite';
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-based animations here
}, 16)); // 60fps

// Add loading animation for images (if any are added later)
function preloadImages() {
    const imageUrls = [
        // Add image URLs here when available
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize image preloading
// preloadImages();

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    }
    
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

// Remove keyboard navigation class on mouse use
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add CSS for keyboard navigation
const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid #A31E22 !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(keyboardStyle);

// Video Background Management
function initVideoBackground() {
    const heroVideo = document.querySelector('#home video');
    
    if (!heroVideo) return;
    
    // Ensure video is muted and autoplays
    heroVideo.muted = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    
    // Handle video loading
    heroVideo.addEventListener('loadeddata', function() {
        console.log('Hero video loaded successfully');
        heroVideo.style.opacity = '1';
    });
    
    // Handle video errors and fallback to image
    heroVideo.addEventListener('error', function() {
        console.warn('Video failed to load, falling back to image');
        const fallbackImg = heroVideo.querySelector('img');
        if (fallbackImg) {
            fallbackImg.style.display = 'block';
            heroVideo.style.display = 'none';
        }
    });
    
    // Show video on all devices including mobile
    heroVideo.style.display = 'block';
    heroVideo.play().catch(e => console.log('Video autoplay prevented:', e));
    const fallbackImg = heroVideo.querySelector('img');
    if (fallbackImg) {
        fallbackImg.style.display = 'none';
    }
    
    // Handle resize events to ensure video stays visible
    window.addEventListener('resize', function() {
        heroVideo.style.display = 'block';
        heroVideo.play().catch(e => console.log('Video autoplay prevented:', e));
        const fallbackImg = heroVideo.querySelector('img');
        if (fallbackImg) {
            fallbackImg.style.display = 'none';
        }
    });
}

console.log('That\'s Amore Pizzeria website loaded successfully! 🍕 The great pizza debate is ready!');
