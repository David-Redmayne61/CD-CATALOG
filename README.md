# CD Catalog App

A web and mobile application for cataloging your CD collection using barcode scanning. Built with React Native, Expo, and Firebase.

## Features

- 📱 **Barcode Scanning** - Use Bluetooth barcode scanner or manual entry
- 🔍 **Automatic Metadata Lookup** - Fetches CD information from MusicBrainz database
- 🎨 **Album Cover Art** - Automatically downloads cover images
- ⏱️ **Total Playing Time** - Auto-calculates duration from track listings or manual entry
- 🔎 **Search & Filter** - Search by title, artist, genre, or barcode
- ✏️ **Edit Records** - Update CD information and add genres
- 🚫 **Duplicate Detection** - Warns when adding a CD that already exists
- 📊 **Organized Display** - Alphabetically sorted with all key information
- 🖨️ **Print/PDF Export** - Generate formatted catalog for printing or saving as PDF
- ☁️ **Cloud Storage** - All data stored in Firebase Firestore

## Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and tooling
- **React Navigation** - Screen navigation
- **TypeScript** - Type-safe JavaScript

### Backend & Services
- **Firebase Firestore** - Cloud database for CD collection
- **Firebase Hosting** - Web app hosting
- **MusicBrainz API** - CD metadata lookup by barcode
- **Cover Art Archive** - Album cover artwork

## External Resources

### MusicBrainz API
- **Purpose**: Lookup CD information by barcode
- **Endpoint**: `https://musicbrainz.org/ws/2/release/`
- **Data Retrieved**: Title, artist, release date, track listings
- **Rate Limit**: 1 request per second
- **Documentation**: https://musicbrainz.org/doc/MusicBrainz_API

### Cover Art Archive
- **Purpose**: Download album cover images
- **Endpoint**: `https://coverartarchive.org/release/`
- **Data Retrieved**: 500px thumbnail images
- **Rate Limit**: 500ms delay between requests
- **Documentation**: https://coverartarchive.org/

### Firebase
- **Firestore Database**: Stores CD collection data
- **Hosting**: Serves web application
- **Project**: cd-catalog
- **Live URL**: https://cd-catalog.web.app

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI
- Expo CLI (optional, installed via npx)

### Install Dependencies
```bash
npm install
```

### Firebase Configuration
The app is pre-configured with Firebase credentials in `src/services/firebase.ts`:
- API Key: AIzaSyDOHJtf7DRCw_xzyP5UqTjP_-HncV3CUM8
- Project ID: cd-catalog
- App ID: 1:935352892439:web:4cfee9ed01e4d82d077052

### Development

**Start development server:**
```bash
npm start
```

**Run on specific platform:**
```bash
npm run web      # Web browser
npm run android  # Android device/emulator
npm run ios      # iOS device/simulator
```

### Deployment

**Deploy to Firebase Hosting:**
```bash
npm run deploy
```

This automated script:
1. Builds the web application
2. Fixes scrolling issues (changes overflow: hidden to overflow: auto)
3. Deploys to Firebase Hosting

**Manual deployment:**
```bash
npx expo export --platform web
(Get-Content dist\index.html) -replace 'overflow: hidden;', 'overflow: auto;' | Set-Content dist\index.html
npx firebase deploy
```

## How It Works

### Adding a CD

1. **Scan or Enter Barcode**
   - Use Bluetooth barcode scanner (paired as keyboard device)
   - Or manually type the barcode number

2. **Lookup CD Information**
   - Click "Lookup Barcode" button
   - App queries MusicBrainz API with barcode
   - Tries multiple formats (original and EAN-13 with leading zeros)

3. **Fetch Additional Data**
   - Downloads album cover from Cover Art Archive
   - Retrieves track listings to calculate total duration
   - Populates title, artist, year, and duration automatically

4. **Manual Entry Option**
   - If lookup fails or data incomplete, enter manually
   - Duration field accepts total minutes (e.g., 57 or 125)
   - Duration displays as "57 min" or "2:05" (HH:MM) on cards

5. **Add Genre and Notes**
   - Select genre from dropdown (23 options)
   - Add optional notes
   - Enter or override duration in minutes if needed
   - Genre defaults to "Unknown" if not selected

6. **Duplicate Check**
   - Before saving, checks Firestore for existing barcode
   - Shows warning if duplicate found
   - Option to cancel or add anyway

7. **Save to Database**
   - Stores in Firebase Firestore with fields:
     - Title, artist, year, genre (required)
     - Barcode, coverUrl, duration, notes (optional)
     - dateAdded timestamp

### Printing & Export

- Click green "Print / Save as PDF" button on home screen
- Opens formatted table view in new window
- Browser print dialog appears automatically
- Save as PDF or print physical copy
- Includes total collection playing time in HH:MM format

### Searching & Filtering

- Real-time search as you type
- Searches across: title, artist, genre, barcode
- Results sorted alphabetically by title
- Shows "No results found" when filter returns nothing

### Editing CDs

- Click "Edit" button on any CD card
- Pre-fills all existing information
- Same duplicate detection (excludes current CD)
- Updates existing record in Firestore

### Deleting CDs

- Click "Delete" button on any CD card
- Confirmation dialog before deletion
- Permanently removes from Firestore

## Data Structure

### CD Record (Firestore)
```typescript
{
  id?: string;              // Auto-generated by Firestore
  title: string;            // Required
  artist: string;           // Required
  year: number;             // Required
  genre: string;            // Required (defaults to "Unknown")
  barcode?: string;         // Optional - UPC/EAN barcode
  coverUrl?: string;        // Optional - Cover image URL
  duration?: number;        // Optional - Total minutes (auto or manual)
  notes?: string;           // Optional - User notes
  dateAdded: Date;          // Timestamp
}
```

## Genre Options

The app includes 23 genre categories:
- Rock, Pop, Classical, Classical Compilation, Compilation
- Jazz, Blues, Country, Electronic, Folk
- Hip Hop, R&B/Soul, Metal, Punk, Reggae
- Alternative, Indie, World Music, Soundtrack
- Opera, Gospel, Dance, Other

## File Structure

```
CDCatalog/
├── src/
│   ├── components/
│   │   └── CDCard.tsx           # Individual CD display card
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Main collection view
│   │   ├── AddCDScreen.tsx      # Add/Edit CD form
│   │   └── BarcodeScannerScreen.tsx (unused - camera scanner)
│   ├── services/
│   │   └── firebase.ts          # Firebase configuration & operations
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── docs/
│   └── API_REFERENCE.md         # MusicBrainz API documentation
├── assets/                      # App icons and images
├── deploy.ps1                   # Automated deployment script
├── App.tsx                      # Root component
├── index.ts                     # Entry point
├── app.json                     # Expo configuration
├── firebase.json                # Firebase Hosting config
└── package.json                 # Dependencies
```

## Hardware Requirements

### Bluetooth Barcode Scanner
- Pairs with iPhone/Android as keyboard input device
- Scanner types barcode directly into text field
- Tested with standard Bluetooth HID scanners
- No special app permissions required

### Supported Barcode Formats
- UPC-A (12 digits)
- EAN-13 (13 digits)
- Automatically tries both formats during lookup

## API Rate Limiting

To comply with MusicBrainz and Cover Art Archive policies:

- **MusicBrainz**: 1 second delay between requests
- **Cover Art Archive**: 500ms delay before request
- **User-Agent**: `CDCatalog/1.0.0 (davidnredmayne@gmail.com)`

Rate limiting is built into the lookup functions to prevent being blocked.

## Browser Compatibility

- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Firefox
- ✅ Edge

**Note**: The app modifies Expo's default `overflow: hidden` CSS to `overflow: auto` during deployment to enable proper scrolling on all browsers.

## Known Issues & Solutions

### Scrolling Not Working
**Issue**: Expo's default web template has `overflow: hidden` on body element  
**Solution**: Automated in deploy script, or manually edit `dist/index.html`

### Keyboard Not Appearing on iPhone
**Issue**: iOS Safari keyboard focus issues  
**Solution**: Tap directly on input field, not surrounding area

### No CD Found
**Issue**: Barcode not in MusicBrainz database  
**Solution**: Manually enter CD information, barcode still saved for future reference

### Duration Format
**Input**: Enter total minutes in the Duration field (e.g., 57 or 125)  
**Display**: Shows as "57 min" for under 60 minutes, or "2:05" (HH:MM) for 60+ minutes  
**Note**: Auto-populated from MusicBrainz when available, can be manually entered or overridden

## Future Enhancements

- Export to CSV/Excel
- Statistics and analytics
- Collection value tracking
- Wishlist feature
- Loan tracking (who borrowed what)
- Multiple collection support

## Support & Contribution

For issues, questions, or contributions:
- Email: davidnredmayne@gmail.com
- Repository: CD-CATALOG (David-Redmayne61)

## License

This project is for personal use. MusicBrainz data is licensed under CC0 (public domain).

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Author**: David Redmayne
