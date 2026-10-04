import urllib.parse

CLIENT_ID = 'c22bafea923c4355ba70e1c5f28fa2cb'
CLIENT_SECRET = 'd671e9da235e40ba84c0ba551c3f1820'
PLAYLIST_ID = '4gMR8loaNK4LaReDVzVeJt'
REDIRECT_URI = 'http://127.0.0.1:8080'
TOKEN_FILE = 'spotify_tokens.json'
TRACKS_FILE = 'playlist_tracks.json'
scope = 'playlist-read-private'
# Corrected parameter encoding
params = {
    'client_id': CLIENT_ID,
    'response_type': 'code',
    'redirect_uri': REDIRECT_URI,
    'scope': scope
}
url = f"https://spotify.com?{urllib.parse.urlencode(params)}"

print("Copy and paste this exact URL into your browser:")
print(url)
