# AI VICTOR PHONK

**Create. Feel. Play. Victorize.**

A responsive Phonk music studio for creating procedural beats locally, building drum patterns, and managing a browser-session library.

> **Current deployment status:** The beat generator renders original procedural audio in the browser and exports WAV files; it is not an AI music service. Accounts and payments are not connected. Advertising is disabled while the site is reviewed for publisher-content compliance. Firebase app initialization and Google Analytics 4 are configured.

## 🚀 Quick Start

### Development server

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Build the static site for Firebase Hosting or Vercel with `npm run build`.

## 📱 Device Support

✅ **Mobile** (320px - 480px)
- Touch-optimized controls
- Responsive grid layouts
- Mobile navigation menu
- Optimized animations

✅ **Tablet** (481px - 768px)
- Balanced layout adjustments
- Touch-friendly interface
- Optimized for landscape/portrait

✅ **Desktop** (769px+)
- Full-featured interface
- Keyboard shortcuts
- Hover effects
- Multi-column layouts

## ⚡ Performance Optimizations

- **CSS Variables** for consistent theming
- **CSS Grid & Flexbox** for responsive layouts
- **Debounced events** to reduce CPU usage
- **Event delegation** for better performance
- **Document fragments** for efficient DOM updates
- **Passive event listeners** for smooth scrolling
- **requestAnimationFrame** for smooth animations
- **will-change** for GPU acceleration
- **Reduced motion support** for accessibility
- **Lazy loading** for images (when implemented)

## 🎨 Features

### Available Prototype Features
- ✅ Dynamic greeting system (time-based)
- ✅ Phonk catalogue browsing and filtering
- ✅ Drum Lab (16-step sequencer)
- ✅ Browser-session library and playlists
- ✅ Procedural phonk audio generation and WAV export
- ⚠️ Music is synthesized locally and is not AI-generated
- ⚠️ Sample catalogue entries do not include audio recordings
- ⚠️ Accounts, subscriptions, and cloud library sync are not connected
- ✅ Generated-beat preview and WAV download
- ⚠️ Mini player, Beat Lab, and Music Editor remain prototype interfaces
- ✅ Library management
- ✅ Discovery section with categories
- ⚠️ Admin dashboard is a prototype interface only
- ✅ Settings and privacy controls

### Responsive Design
- ✅ Mobile-first approach
- ✅ Fluid typography with clamp()
- ✅ Flexible grid layouts
- ✅ Touch-friendly buttons (min 44px)
- ✅ Optimized scroll performance
- ✅ Hardware-accelerated animations

## 🌐 Search and ownership verification

- `robots.txt` permits public crawling and points to the sitemap.
- `sitemap.xml` lists the public homepage.
- `google01f842ee1eaaecce.html` and the two homepage verification meta tags are present for Google site ownership checks.
- `ads.txt` contains the existing publisher declaration. Ad delivery is disabled in the website until the content and account are ready for review.
- Google Analytics 4 uses the supplied Measurement ID `G-XTPF8EHFLP`.
- The Google tag destination `GT-K4LX6TSN` is configured in the page head.
- Firebase app initialization uses project `ai-victor-phonk`; Authentication, Firestore, and Storage features are not enabled in this prototype.

The Google DNS verification CNAME cannot be applied from this repository. In the DNS control panel for the verified domain, add the record exactly as supplied by Google:

| Type | Host/Name | Target/Value |
|---|---|---|
| CNAME | `vnrzw6wt2fcn` | `gv-cq4jq4xo3lzkg.dv.googlehosted.com` |

DNS propagation and Google verification must be completed in the corresponding provider accounts.

## 📁 Project Structure

```
AI VICTOR PHONK/
├── index.html          # Main application
├── firebase-init.js    # Firebase Web SDK setup
├── styles.css          # Optimized responsive CSS
├── script.js           # UI and local beat synthesis
├── assets/              # Supplied cover artwork
├── package.json         # Build and Firebase scripts
├── package-lock.json    # Locked npm dependencies
├── vite.config.mjs     # Static bundle and verification assets
├── firebase.json       # Firebase Hosting configuration
├── robots.txt          # Crawler instructions
├── sitemap.xml         # Public homepage sitemap
├── ads.txt             # Publisher declaration
└── README.md          # This file
```

## 🎯 Usage

### Generate a beat

1. Navigate to **Generator**
2. Enter a prompt and choose genre, mood, tempo, key, duration, and instruments
3. Click **Generate Beat** to render a WAV locally in your browser
4. Preview or download the generated WAV

### Using Drum Lab

1. Navigate to **Drum Lab**
2. Set BPM and parameters
3. Click steps to activate drum hits
4. Use controls to randomize, clear, or save
5. Play your pattern

### Managing Library

1. Navigate to **Library**
2. Switch between tabs (Favorites, Downloads, etc.)
3. Add tracks to favorites
4. Create and manage playlists

## ⌨️ Keyboard Shortcuts

- `Space` - Play/Pause
- `Arrow Left` - Previous track
- `Arrow Right` - Next track
- `F` - Toggle favorite

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Security

- No hardcoded credentials
- No production admin authentication, accounts, or API backend are included

## 📝 Notes

- The app uses Vite to bundle the Firebase Web SDK.
- The sample catalogue entries are metadata examples without recordings or licensing claims.
- Locally generated beats are not sent to Firebase or an AI provider.
- Google Analytics is enabled; see the Privacy Policy for the analytics disclosure.

## 🚀 Firebase Hosting

Firebase Hosting is preconfigured for the Vite `dist/` output:

```bash
npm install -g firebase-tools
npm run build
firebase login
firebase deploy --only hosting
```

The `.firebaserc` and `firebase.json` files replace the interactive Hosting setup. A project owner must complete `firebase login` in their own browser session before deployment.

## 🎶 Phonk Categories

- Phonk
- Drift Phonk
- Brazilian Phonk
- Aggressive Phonk
- Dark Phonk
- Atmospheric Phonk
- Night Drive
- Gym Phonk
- Chill Phonk
- Instrumental
- Sample Catalogue
- Drum Beats
- Bass Beats
- Experimental

## 🤝 Contributing

This is a demo/prototype. For production:

- Add real audio processing
- Implement actual AI music APIs
- Add user authentication
- Set up a proper database
- Implement file storage (S3, etc.)
- Add payment processing

## 📄 License

MIT License

---

**AI VICTOR PHONK** - Create. Feel. Play. Victorize.
