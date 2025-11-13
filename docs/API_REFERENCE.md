# MusicBrainz API Reference

This document contains the API endpoints used by the CD Catalog app.

## MusicBrainz API Endpoints

### 1. Barcode Lookup
Search for a CD by barcode:
```
https://musicbrainz.org/ws/2/release/?query=barcode:{BARCODE}&fmt=json
```

**Example:**
```
https://musicbrainz.org/ws/2/release/?query=barcode:72435432462&fmt=json
```

**Response includes:**
- Title
- Artist
- Release date
- Release ID (for further queries)

---

### 2. Detailed Release Info (with Duration)
Get full release details including track listings and durations:
```
https://musicbrainz.org/ws/2/release/{RELEASE_ID}?fmt=json&inc=recordings
```

**Example:**
```
https://musicbrainz.org/ws/2/release/fbf0a5ee-f9ef-3077-a38a-f990a1b9c8eb?fmt=json&inc=recordings
```

**Response includes:**
- All tracks with their lengths (in milliseconds)
- Full media information

---

### 3. Cover Art Archive
Get album cover artwork:
```
https://coverartarchive.org/release/{RELEASE_ID}
```

**Example:**
```
https://coverartarchive.org/release/fbf0a5ee-f9ef-3077-a38a-f990a1b9c8eb
```

**Thumbnail (500px):**
```
https://coverartarchive.org/release/{RELEASE_ID}/front-500
```

---

## Important Notes

### User-Agent Header
MusicBrainz requires a User-Agent header in all requests:
```
User-Agent: CDCatalog/1.0.0 (davidnredmayne@gmail.com)
```

### Rate Limiting
- Wait **1 second** between MusicBrainz API requests
- Wait **500ms** before Cover Art Archive requests
- Maximum 1 request per second to avoid being blocked

### Barcode Formats
The app tries multiple formats:
1. Original barcode as entered
2. Padded to 13 digits with leading zeros (EAN-13 format)

---

## Example Workflow

For barcode: `093624590125`

1. **Search by barcode:**
   ```
   https://musicbrainz.org/ws/2/release/?query=barcode:093624590125&fmt=json
   ```
   Returns: Release ID `fbf0a5ee-f9ef-3077-a38a-f990a1b9c8eb`

2. **Get cover art:**
   ```
   https://coverartarchive.org/release/fbf0a5ee-f9ef-3077-a38a-f990a1b9c8eb
   ```

3. **Get duration:**
   ```
   https://musicbrainz.org/ws/2/release/fbf0a5ee-f9ef-3077-a38a-f990a1b9c8eb?fmt=json&inc=recordings
   ```
   Calculate total milliseconds from all tracks, convert to minutes

---

## Testing in Browser

You can paste any of these URLs directly into a browser to see the JSON response.

Example test barcodes:
- `093624590125` - Alanis Morissette: Jagged Little Pill
- `4891030501102` - Hungarian Dances

---

## API Documentation

Full MusicBrainz API documentation:
https://musicbrainz.org/doc/MusicBrainz_API

Cover Art Archive documentation:
https://coverartarchive.org/
