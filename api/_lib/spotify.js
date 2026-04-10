async function getSpotifyToken() {
  const authStr = Buffer.from(
    `${process.env.CLIENT?.trim()}:${process.env.SEKWET?.trim()}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authStr}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    console.error(`Spotify token error ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json();
  return data.access_token;
}

async function searchTracks(token, query) {
  const params = new URLSearchParams({ q: query, type: 'track', limit: 5 });
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error(`Spotify search error ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json();
  return data.tracks?.items ?? [];
}

function formatTrack(track) {
  const album = track.album ?? {};
  return {
    name:         track.name ?? 'Unknown Title',
    artist:       track.artists?.[0]?.name ?? 'Unknown Artist',
    album:        album.name ?? 'Unknown Album',
    image_url:    album.images?.[0]?.url ?? null,
    spotify_url:  track.external_urls?.spotify ?? null,
    preview_url:  track.preview_url ?? null,
    duration_ms:  track.duration_ms ?? null,
    release_date: album.release_date ?? null,
  };
}

module.exports = { getSpotifyToken, searchTracks, formatTrack };
