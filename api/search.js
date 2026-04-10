import { getSpotifyToken, searchTracks, formatTrack, getiTunesPreview } from './_lib/spotify.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { query } = req.body ?? {}
    if (!query) return res.status(400).json({ error: 'Query required' })

    const token = await getSpotifyToken()
    if (!token) return res.status(500).json({ error: 'Spotify auth failed' })

    const items = await searchTracks(token, query)
    if (!items) return res.status(500).json({ error: 'Spotify search failed' })
    if (!items.length) return res.status(404).json({ error: 'No tracks found' })

    const tracks = await Promise.all(items.map(async (item) => {
      const track = formatTrack(item)
      // If Spotify didn't provide a preview, try iTunes fallback
      if (!track.preview_url) {
        track.preview_url = await getiTunesPreview(track.artist, track.name)
      }
      return track
    }))

    return res.status(200).json({ tracks })
  } catch (err) {
    console.error('/api/search error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
