const functions = require('firebase-functions');

// Proxy function to fetch cover art from Cover Art Archive
// This bypasses iOS restrictions by making the request server-side
exports.getCoverArt = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const releaseId = req.query.releaseId;
  
  if (!releaseId) {
    res.status(400).json({ error: 'releaseId parameter is required' });
    return;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(
      `https://coverartarchive.org/release/${releaseId}`,
      {
        headers: {
          'User-Agent': 'CDCatalog/1.0.0 (davidnredmayne@gmail.com)',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ error: 'Cover art not found' });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching cover art:', error);
    res.status(500).json({ error: 'Failed to fetch cover art' });
  }
});
