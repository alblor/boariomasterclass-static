# Boario Masterclass - Static Website

A professional static website for the Boario Masterclass music association in Italy, featuring a modern, responsive design with internationalization support and dark/light theme functionality.

## 🌐 Live Website

You can visit the live website at: [https://boariomasterclass.com](https://boariomasterclass.com)

## 📋 Project Overview

This is the frontend static component of a full-stack web development project designed and coded from scratch for a small music association in Boario Terme, Italy. The website showcases the annual summer music masterclass program featuring international instructors across various instruments and skill levels.

**Note:** The backend API and admin functionality are hosted in a separate repository, and are currently private.

## ✨ Features

### Core Functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices, so different window sizes are supported
- **Internationalization**: Full Italian/English language support with dynamic content switching, and all the faculty information is available in both languages (curriculum included)
- **Theme System**: Light/dark mode toggle with user preference persistence using browser storage
- **SEO Optimized**: Complete meta tags, Open Graph, and Twitter Card integration, for better visibility by search engines
- **Gallery System**: Interactive image gallery with navigation controls for a sleek and modern look
- **Video Integration**: Embedded presentation videos with custom thumbnails

### Technical Features
- **Progressive Enhancement**: Works without JavaScript, enhanced with JavaScript
- **Performance Optimized**: Lazy loading, optimized images, and efficient CSS
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML
- **Cross-browser Compatibility**: Tested across modern browsers
- **Custom 404 Page**: Branded error handling

### Content Management
- **Teacher Profiles**: Dynamic instructor showcase with biographical information
- **Course Information**: Detailed masterclass descriptions and schedules
- **Registration System**: Integrated registration form (connects to backend)
- **Admin Interface**: Administrative dashboard for content management

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), no frameworks used
- **Icons**: Custom SVG icons and favicons
- **Images**: Optimized JPEG/PNG assets with responsive loading
- **Fonts**: Web-safe typography with fallbacks
- **Analytics**: Google Analytics integration ready but not implemented

## 📁 Project Structure

```
boariomasterclass-static/
├── index.html              # Main homepage
├── registration.html       # Registration form page
├── admin.html             # Admin dashboard
├── admin-login.html       # Admin authentication
├── 404.html               # Custom error page
├── css/
│   ├── style.css          # Main stylesheet
│   ├── video-presentation.css
│   └── 404.css
├── js/
│   ├── script.js          # Main application logic
│   ├── i18n.js           # Internationalization
│   ├── registration.js    # Form handling
│   ├── admin.js          # Admin functionality
│   └── curriculum.js     # Course management
├── images/                # Image assets
│   ├── gallery/          # Gallery images
│   ├── teachers/         # Instructor photos
│   ├── hotel/           # Accommodation images
│   └── svgs/            # Vector graphics
└── videos/               # Video presentations
```

## 🌍 Internationalization

The website supports dynamic language switching between Italian (default) and English:

- URL parameter support: `?lang=en` or `?lang=it`
- Persistent user preference storage
- Complete translation of all content, meta tags, and UI elements
- Automatic browser language detection

## 🎨 Theming

Dynamic theme switching with:
- Light and dark mode variants
- System preference detection
- Smooth transitions between themes
- Persistent user choice storage

## 🚀 Getting Started

### Prerequisites
- Web server (Apache, Nginx, or development server)
- Modern web browser

### Local Development
1. Clone this repository
2. Serve the files using any HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

If you don't need to test the backend functionality, you can also browse the website from the index.html

### Deployment
Simply upload all files to your web server's document root. The website is completely static and requires no server-side processing.

## 🔧 Configuration

### Backend Integration
To connect with the backend API:
1. Update API endpoints in `js/registration.js` and `js/admin.js`
2. Configure CORS settings on your backend server
3. Update the admin login endpoint in `js/admin.js`

### Analytics
Add your Google Analytics tracking ID in the HTML head section.

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Testing

The website has been tested for:
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance
- Performance optimization
- SEO effectiveness

## 📄 License

This project is part of an open-source portfolio showcasing full-stack web development capabilities, and cannot be used for commercial purpose.

## 👨‍💻 Developer

Developed by Lorenzo Albanese as part of a series of full-stack projects demonstrating modern web development practices and technologies.

---

*This static website is the frontend component of a complete full-stack solution. The backend repository contains the API, database management, and server-side functionality.*
