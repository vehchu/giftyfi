const { db }                              = require('./_lib/firebase');
const { getSpotifyToken, searchTracks, formatTrack } = require('./_lib/spotify');
const { toBase62 }                        = require('./_lib/base62');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // CORS preflight
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query } = req.body ?? {};
    if (!query) return res.status(400).json({ error: 'Query required' });

    console.log(`Searching: ${query}`);

    // 1. Authenticate with Spotify
    const token = await getSpotifyToken();
    if (!token) return res.status(500).json({ error: 'Failed to authenticate with Spotify' });

    // 2. Search
    const tracks = await searchTracks(token, query);
    if (!tracks)          return res.status(500).json({ error: 'Spotify search failed' });
    if (!tracks.length)   return res.status(404).json({ error: 'No tracks found' });

    const track = formatTrack(tracks[0]);
    console.log(`Top track: ${track.name} by ${track.artist}`);

    // 3. Atomic counter increment → base62 shortcode
    //    Uses a Firestore transaction so concurrent requests never collide
    const counterRef = db.collection('_meta').doc('counter');
    let shortcode;

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const next = (snap.exists ? snap.data().value : 0) + 1;
      tx.set(counterRef, { value: next });
      shortcode = toBase62(next);
    });

    // 4. Persist gift in Firestore
    await db.collection('gifts').doc(shortcode).set({
      ...track,
      created_at: new Date().toISOString(),
    });

    const baseUrl = `https://${req.headers.host}`;
    console.log(`Gift created: ${baseUrl}/gift/${shortcode}`);

    return res.status(200).json({
      song: {
        name:        track.name,
        artist:      track.artist,
        album:       track.album,
        image_url:   track.image_url,
        spotify_url: track.spotify_url,
        preview_url: track.preview_url,
      },
      gift_link: `${baseUrl}/gift/${shortcode}`,
      link_id:   shortcode,
    });

  } catch (err) {
    console.error('Error in /api/search:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
