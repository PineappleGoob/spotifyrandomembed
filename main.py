import random
from spotify_scraper import SpotifyClient
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

playlist_url = "https://open.spotify.com/playlist/4gMR8loaNK4LaReDVzVeJt"

def get_random_song_id(url):
    client = SpotifyClient()
    playlist = client.get_playlist(url)
    tracks = playlist.tracks
    
    if not tracks:
        return None
        
    random_track = random.choice(tracks)
    return random_track.track.id

@app.route('/')
def home():
    return render_template('index.html', title="Home Page")

@app.route('/api/status', methods=['GET'])
def get_status():
    track_id = get_random_song_id(playlist_url)
    
    if not track_id:
        return jsonify({"status": "error", "message": "Could not retrieve track"}), 500
        
    # Return strictly the 22-character ID inside your JSON map
    payload = {
        "status": "success",
        "message": track_id
    }
    return jsonify(payload), 200

if __name__ == '__main__':
    # Keep print statement inside the main execution runtime block
    print("Initial check ID:", get_random_song_id(playlist_url))
    app.run(debug=True)
