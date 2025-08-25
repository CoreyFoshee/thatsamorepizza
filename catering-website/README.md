# That's Amore Catering - Standalone Website

This is a completely separate, standalone catering website that operates independently from the main That's Amore Pizzeria website.

## 🏗️ Project Structure

```
catering-website/
├── package.json                 # Dependencies and scripts
├── catering-server.js          # Express server for catering site
├── README.md                   # This file
├── views/                      # EJS templates
│   ├── catering-layout.ejs     # Main layout template
│   ├── catering-home.ejs       # Homepage content
│   └── partials/               # Reusable components
│       ├── catering-navbar.ejs # Navigation bar
│       └── catering-footer.ejs # Footer
├── public/                     # Static assets
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
│   ├── images/                 # Images
│   ├── Logo/                   # Logo files
│   └── videos/                 # Video files
└── data/                       # Data files (if needed)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Navigate to the catering website directory:**
   ```bash
   cd catering-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Or start the production server:**
   ```bash
   npm start
   ```

The catering website will be available at `http://localhost:3001`

## 🌐 Available Routes

- **`/`** - Homepage with catering overview
- **`/menu`** - Complete catering menu (to be implemented)
- **`/services`** - Detailed catering services (to be implemented)
- **`/quote`** - Catering quote form (to be implemented)
- **`/contact`** - Contact information (to be implemented)
- **`/test`** - API test endpoint

## 🎨 Features

### 1. **Standalone Architecture**
- Completely separate from main restaurant website
- Independent server and routing
- Dedicated catering branding and messaging

### 2. **Professional Design**
- Modern, responsive design using Tailwind CSS
- Catering-focused color scheme and typography
- Mobile-first approach

### 3. **Content Structure**
- Hero section with catering focus
- Service overviews (Corporate, Private, Special Events)
- Menu preview with pricing
- Catering tips and guidelines
- Call-to-action sections

### 4. **Navigation**
- Clean, intuitive navigation
- Mobile-responsive menu
- Quick access to key sections

## 🔧 Configuration

### Port Configuration
The catering website runs on port 3001 by default to avoid conflicts with the main website (port 3000).

```javascript
const PORT = process.env.PORT || 3001;
```

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (if needed)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔗 Integration

### With Main Website
- Can be deployed to a subdomain (e.g., `catering.thatsamorepizza.com`)
- Shares assets (images, logos, videos) with main site
- Independent operation and maintenance

### External Services
- Ready for integration with catering management systems
- Can be connected to online ordering platforms
- Prepared for CRM integration

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Basic website structure
- ✅ Homepage with service overview
- ✅ Responsive navigation
- ✅ Professional layout

### Phase 2 (Next)
- [ ] Complete catering menu page
- [ ] Detailed services page
- [ ] Quote request form
- [ ] Contact page

### Phase 3 (Future)
- [ ] Online ordering system
- [ ] Customer portal
- [ ] Event management
- [ ] Payment processing
- [ ] Analytics and reporting

## 🛠️ Development

### Adding New Pages
1. Create new EJS template in `views/`
2. Add route in `catering-server.js`
3. Update navigation if needed
4. Test responsiveness

### Styling
- Uses Tailwind CSS for styling
- Custom CSS can be added in `public/css/catering-styles.css`
- Maintains consistent branding with main site

### Content Updates
- All content is in EJS templates
- Easy to update text, images, and pricing
- SEO-optimized meta tags

## 📊 Performance

- Optimized for fast loading
- Responsive images and videos
- Efficient asset delivery
- SEO best practices

## 🔒 Security

- Input validation on forms
- Secure routing
- Environment variable protection
- Regular dependency updates

## 📞 Support

For technical support or questions about the catering website:
- **Email**: catering@thatsamorepizza.com
- **Phone**: (504) 463-5384
- **Address**: 4441 West Metairie Ave, Metairie, LA 70001

## 📄 License

This project is proprietary to That's Amore Pizzeria. All rights reserved.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active Development
