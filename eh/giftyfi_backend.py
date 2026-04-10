from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load .env from the project root (one level up from /eh)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

CLIENT_ID = os.getenv("CLIENT")
CLIENT_SECRET = os.getenv("SEKWET")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store for gift links (in-memory for MVP)
gift_links = {}


def get_spotify_access_token():
    """Get a fresh access token using Client Credentials flow"""
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    auth_base64 = base64.b64encode(auth_str.encode("ascii")).decode("ascii")

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={"grant_type": "client_credentials"}
    )

    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        print(f"ERROR getting token: {response.status_code} - {response.text}")
        return None


def search_spotify_song(access_token, query):
    """Search for a song on Spotify Web API"""
    response = requests.get(
        "https://api.spotify.com/v1/search",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"q": query, "type": "track", "limit": 5}
    )

    print(f"Spotify search status: {response.status_code}")

    if response.status_code == 200:
        return response.json().get("tracks", {}).get("items", [])
    else:
        print(f"ERROR: {response.text}")
        return None


def format_track(track):
    """Map a Spotify track object to our standard format"""
    artists = track.get("artists", [])
    artist_name = artists[0].get("name", "Unknown Artist") if artists else "Unknown Artist"
    album = track.get("album", {})
    images = album.get("images", [])

    return {
        "name": track.get("name", "Unknown Title"),
        "artist": artist_name,
        "album": album.get("name", "Unknown Album"),
        "image_url": images[0].get("url") if images else None,
        "spotify_url": track.get("external_urls", {}).get("spotify"),
        "preview_url": track.get("preview_url"),
        "duration_ms": track.get("duration_ms"),
        "release_date": album.get("release_date"),
    }


@app.route("/search", methods=["POST"])
def search_song():
    """Search for a song and create a unique gift link"""
    try:
        data = request.json
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query required"}), 400

        print(f"\n--- Searching for: {query} ---")

        access_token = get_spotify_access_token()
        if not access_token:
            return jsonify({"error": "Failed to authenticate with Spotify"}), 500

        print(f"Got access token: {access_token[:20]}...")

        tracks = search_spotify_song(access_token, query)
        if tracks is None:
            return jsonify({"error": "Failed to search Spotify"}), 500
        if not tracks:
            return jsonify({"error": "No tracks found"}), 404

        top_track = format_track(tracks[0])
        print(f"Top track: {top_track['name']} by {top_track['artist']}")

        link_id = str(uuid.uuid4())
        gift_links[link_id] = {
            "track": top_track,
            "created_at": datetime.now(),
        }

        return jsonify({
            "song": {
                "name": top_track["name"],
                "artist": top_track["artist"],
                "album": top_track["album"],
                "image_url": top_track["image_url"],
                "spotify_url": top_track["spotify_url"],
                "preview_url": top_track["preview_url"],
            },
            "gift_link": f"http://127.0.0.1:5000/gift/{link_id}",
            "link_id": link_id
        }), 200

    except Exception as e:
        print(f"\nERROR in search_song: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/gift/<link_id>", methods=["GET"])
def get_gift(link_id):
    """Retrieve the song data from a gift link"""
    if link_id not in gift_links:
        return jsonify({"error": "Gift link not found or expired"}), 404

    track = gift_links[link_id]["track"]

    return jsonify({
        "message": "🎵 Someone sent you a song!",
        "song": {
            "name": track["name"],
            "artist": track["artist"],
            "album": track["album"],
            "image_url": track["image_url"],
            "spotify_url": track["spotify_url"],
            "preview_url": track["preview_url"],
            "duration_ms": track["duration_ms"],
            "release_date": track["release_date"],
        }
    }), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)