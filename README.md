# That's Amore Pizzeria Website

A modern, animated, mobile-responsive website for That's Amore Pizzeria, a family-owned restaurant in Metairie, Louisiana that serves both New York thin crust and Chicago deep dish pizza.

## 🍕 About the Project

This website is built around the fun "Great Pizza Debate" theme - Chicago Style vs New York Deep Dish. The site features interactive elements, smooth animations, and a comprehensive online presence for the pizzeria.

## ✨ Features

### 🎭 **Pizza Debate Theme**
- Interactive poll system for customers to vote on their preferred pizza style
- Dedicated sections showcasing both NY and Chicago styles
- Engaging content that encourages customer interaction

### 📱 **Responsive Design**
- Mobile-first approach using Tailwind CSS
- Responsive grid layouts that adapt to all screen sizes
- Touch-friendly navigation and interactive elements

### 🎨 **Modern Animations**
- Scroll-triggered animations using Intersection Observer API
- Smooth hover effects and transitions
- Typewriter text effects and count-up animations
- Parallax scrolling effects

### 🗂️ **Complete Website Structure**
- **Homepage** (`index.html`) - Hero section, pizza debate, interactive poll
- **Menu Page** (`menu.html`) - Complete menu with pricing and categories
- **Catering Page** (`catering.html`) - Services, packages, and quote forms
- **Franchise Page** (`franchise.html`) - Opportunities and application forms
- **Contact Page** (`contact.html`) - Business info, forms, and FAQ

## 🛠️ Technology Stack

- **HTML5** - Semantic markup and structure
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - ES6+ functionality without frameworks
- **Google Fonts** - Playfair Display and Inter typography
- **CSS Animations** - Custom keyframes and transitions

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- Local web server (optional, for development)

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd thats-amore-website
   ```

2. Open `index.html` in your web browser
   - For development, consider using a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have it installed)
   npx serve .
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
thats-amore-website/
├── index.html              # Homepage with pizza debate theme
├── menu.html               # Complete menu page
├── catering.html           # Catering services page
├── franchise.html          # Franchise opportunities page
├── contact.html            # Contact information page
├── styles.css              # Custom CSS and animations
├── script.js               # JavaScript functionality
├── Logo/                   # Logo assets
│   └── TA_LOGO_Final_black.png
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
└── thats_amore_design.json # Original design specifications
```

## 🎨 Customization

### Colors
The website uses a custom color scheme defined in Tailwind config:
- **Primary**: `#A31E22` (deep red)
- **Secondary**: `#F4E6D9` (cream)
- **Accent**: `#FFD700` (gold)
- **Dark**: `#1F1F1F` (near black)

### Fonts
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Animations
Custom CSS animations include:
- `fadeIn`, `slideUp`, `slideLeft`, `slideRight`
- `scaleIn`, `float`, `gradient`, `typewriter`
- `battle`, `countUp`, `voteConfirmation`

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly buttons and forms
- Optimized typography for mobile devices
- Smooth animations that work on mobile

## 🔧 JavaScript Features

### Core Functionality
- **Navigation**: Smooth scrolling and mobile menu
- **Animations**: Scroll-triggered effects and parallax
- **Forms**: Interactive forms with validation feedback
- **Poll System**: Real-time voting with localStorage persistence
- **Typewriter**: Dynamic text cycling effects

### Performance Optimizations
- Throttled scroll events
- Intersection Observer for efficient animations
- Local storage for user preferences
- Optimized animation timing

## 📋 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Static Hosting
The website can be deployed to any static hosting service:
- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Enable in repository settings
- **AWS S3**: Upload files to S3 bucket

### Custom Domain
- Update navigation links in all HTML files
- Configure DNS settings with your hosting provider
- Update meta tags and canonical URLs

## 🔄 Updates and Maintenance

### Content Updates
- **Menu Items**: Edit `menu.html` for pricing and items
- **Business Info**: Update contact details in all pages
- **Hours**: Modify business hours in `contact.html`
- **Catering Packages**: Adjust pricing in `catering.html`

### Feature Additions
- **New Pages**: Follow the existing HTML structure
- **Animations**: Add new keyframes to `styles.css`
- **Functionality**: Extend `script.js` with new features

## 🐛 Troubleshooting

### Common Issues
1. **Animations not working**: Check if JavaScript is enabled
2. **Mobile layout issues**: Verify viewport meta tag
3. **Fonts not loading**: Check internet connection for Google Fonts
4. **Forms not submitting**: Ensure all required fields are filled

### Debug Mode
Add `?debug=true` to any URL to enable console logging:
```javascript
// In script.js
if (window.location.search.includes('debug=true')) {
    console.log('Debug mode enabled');
}
```

## 📞 Support

For technical support or questions about the website:
- **Email**: [Your email]
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check this README and code comments

## 📄 License

This project is proprietary and confidential. All rights reserved by That's Amore Pizzeria.

## 🙏 Acknowledgments

- **Design Inspiration**: Original design specifications from `thats_amore_design.json`
- **Icons**: Emoji-based iconography for universal compatibility
- **Fonts**: Google Fonts for typography
- **CSS Framework**: Tailwind CSS for utility-first styling

---

**Built with ❤️ for That's Amore Pizzeria**

*Last updated: December 2024*
