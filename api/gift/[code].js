import { db } from '../_lib/firebase.js';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code required' });

  try {
    const snap = await db.collection('gifts').doc(code).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Gift not found or expired' });
    }

    const track = snap.data();

    return res.status(200).json({
      message: '🎵 Someone sent you a song!',
      sender: track.sender || null,
      note: track.message || null,
      song: {
        name:         track.name,
        artist:       track.artist,
        album:        track.album,
        image_url:    track.image_url,
        spotify_url:  track.spotify_url,
        preview_url:  track.preview_url,
        duration_ms:  track.duration_ms,
        release_date: track.release_date,
      },
    });

  } catch (err) {
    console.error('Error in /api/gift/[code]:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
