# That's Amore Pizzeria Website 🍕

A modern, animated, mobile-responsive website for That's Amore Pizzeria featuring the Great Pizza Debate theme between Chicago Deep Dish and New York Thin Crust pizza.

## ✨ Features

- **Pizza Debate Theme**: Interactive poll system for Chicago vs New York style preferences
- **Modern Animations**: Scroll-triggered animations, typewriter effects, and smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component-Based**: Reusable navbar and footer components using EJS templating
- **Interactive Elements**: Poll voting, smooth scrolling, and hover effects

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd thats-amore-website

# Install dependencies
npm install

# Start the development server
npm start
```

The website will be available at `http://localhost:3000`

### Development Mode
```bash
# Install nodemon for development (optional)
npm install -g nodemon

# Start with auto-reload
npm run dev
```

## 🏗️ Project Structure

```
thats-amore-website/
├── views/                    # EJS templates
│   ├── partials/            # Reusable components
│   │   ├── head.ejs         # Common head content
│   │   ├── navbar.ejs       # Navigation component
│   │   ├── footer.ejs       # Footer component
│   │   └── scripts.ejs      # Common JavaScript
│   ├── layout.ejs           # Main layout template
│   ├── index.ejs            # Homepage
│   ├── menu.ejs             # Menu page
│   ├── catering.ejs         # Catering page
│   ├── franchise.ejs        # Franchise page
│   └── contact.ejs          # Contact page
├── public/                   # Static assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── Logo/                # Logo images
├── server.js                 # Express server
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎨 Technology Stack

- **Backend**: Node.js with Express
- **Templating**: EJS with express-ejs-layouts
- **Styling**: Tailwind CSS
- **Frontend**: Vanilla JavaScript (ES6+)
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **Icons**: Emoji and custom CSS icons

## 📱 Pages

1. **Homepage** (`/`) - Pizza debate theme with interactive poll
2. **Menu** (`/menu`) - Popular menu items showcase
3. **Catering** (`/catering`) - Corporate and event catering services
4. **Franchise** (`/franchise`) - Franchise opportunities
5. **Contact** (`/contact`) - Location, hours, and contact forms

## 🔧 Customization

### Adding New Pages
1. Create a new `.ejs` file in the `views/` directory
2. Add a route in `server.js`
3. The navbar and footer will automatically be included

### Modifying Components
- **Navbar**: Edit `views/partials/navbar.ejs`
- **Footer**: Edit `views/partials/footer.ejs`
- **Head**: Edit `views/partials/head.ejs`

### Styling
- Main styles are in `public/css/styles.css`
- Tailwind CSS classes are used throughout
- Custom animations are defined in CSS

## 🚀 Deployment

### Production Build
```bash
npm run production
```

### Build Script
```bash
npm run build
```

## 📊 Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm run production` - Create production build
- `npm run status` - Check git status

## 🎯 Key Features

### Interactive Poll System
- Real-time voting for pizza style preferences
- Local storage persistence
- Animated progress bars and vote counters

### Animation System
- Scroll-triggered animations using Intersection Observer
- Staggered animation delays for smooth visual flow
- CSS keyframe animations for special effects

### Responsive Design
- Mobile-first approach
- Tailwind CSS utility classes
- Flexible grid layouts

## 🔍 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is proprietary to That's Amore Pizzeria.

## 🤝 Contributing

This is a private project for That's Amore Pizzeria. For questions or support, please contact the development team.

---

**That's Amore Pizzeria** - Where the Great Pizza Debate Ends! 🍕🗽🏙️
