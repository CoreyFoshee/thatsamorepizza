# That's Amore Catering - Standalone Website

This is a standalone catering website that can function independently from the main That's Amore Pizzeria website.

## Overview

The standalone catering website provides a focused, professional experience specifically for catering inquiries and services. It includes:

- **Dedicated catering homepage** (`/catering-standalone` or `/catering-website`)
- **Catering-specific navigation** with relevant menu items
- **Catering-focused content** highlighting services and menu options
- **Professional catering layout** separate from the main restaurant site

## Access Points

### Primary Route
- **URL**: `/catering-standalone`
- **Purpose**: Main standalone catering website
- **Layout**: Uses `catering-layout.ejs`

### Alternative Route
- **URL**: `/catering-website`
- **Purpose**: Alternative access point for the same content
- **Layout**: Uses `catering-layout.ejs`

## File Structure

```
views/
├── catering-layout.ejs          # Catering-specific layout
├── catering-home.ejs            # Catering homepage content
├── partials/
│   ├── catering-navbar.ejs      # Catering navigation
│   └── catering-footer.ejs      # Catering footer
└── catering.ejs                 # Original catering page (still accessible at /catering)
```

## Features

### 1. Dedicated Catering Layout
- Separate from main restaurant layout
- Catering-focused meta tags and SEO
- Professional catering branding

### 2. Catering-Specific Navigation
- Home, Menu, Services, Get Quote, Contact
- Mobile-responsive design
- Call-to-action buttons prominently displayed

### 3. Catering Homepage Content
- Hero section with catering focus
- Why choose our catering section
- Catering services overview
- Menu preview
- Catering tips and guidelines
- Call-to-action sections

### 4. Professional Footer
- Catering-specific information
- Business hours
- Contact details
- Quick links

## Usage

### For Clients
1. Visit `/catering-standalone` for the dedicated catering experience
2. Navigate through catering services and menu options
3. Use the contact form or call button for inquiries
4. Access the full catering menu and services

### For Development
1. The standalone site uses its own layout (`catering-layout.ejs`)
2. Content is in `catering-home.ejs`
3. Navigation and footer are in separate partial files
4. Routes are defined in `server.js`

## Benefits

1. **Focused Experience**: Dedicated catering content without restaurant distractions
2. **Professional Presentation**: Catering-specific branding and messaging
3. **SEO Optimization**: Separate meta tags and content for catering services
4. **Easy Maintenance**: Modular structure for easy updates
5. **Scalability**: Can be easily extended with additional catering pages

## Future Enhancements

- Add dedicated catering menu page
- Include catering gallery/portfolio
- Add online ordering for catering
- Include testimonials and reviews
- Add catering blog/news section

## Technical Notes

- Uses EJS templating engine
- Responsive design with Tailwind CSS
- Mobile-first approach
- SEO optimized with proper meta tags
- Fast loading with optimized assets

## Contact

For questions about the catering website or to request modifications, contact the development team.
