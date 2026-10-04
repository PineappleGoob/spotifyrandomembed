// CONFIGURATION
const CLIENT_ID = 'YOUR_CLIENT_ID'; 
const REDIRECT_URI = 'http://localhost:5500'; // Must exactly match your Spotify Dashboard settings

// 1. PKCE Helper Functions for Secure Authentication
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
}

// 2. Redirect User to Spotify Login
async function redirectToSpotifyAuth() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: 'user-read-private user-read-email', // Add required permissions here
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    window.location.href = `https://spotify.com{params.toString()}`;
}

// 3. Exchange Authorization Code for an Access Token
async function getAccessToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');

    const payload = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
        }),
    };

    const response = await fetch('https://accounts.spotify.com/api/token', payload);
    const data = await response.json();
    return data.access_token;
}

// 4. Make an Authenticated Call to the Spotify API
async function fetchUserProfile() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return alert('No access token found. Please log in.');

    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const profileData = await response.json();
        displayProfile(profileData);
    } catch (error) {
        console.error(error);
        alert('Session expired. Please log in again.');
        localStorage.clear();
        window.location.reload();
    }
}

// UI Rendering Helper
function displayProfile(data) {
    const profileDiv = document.getElementById('profile');
    profileDiv.innerHTML = `
        <h3>Welcome, ${data.display_name}!</h3>
        <p>Email: ${data.email}</p>
        <p>Country: ${data.country}</p>
        ${data.images[0] ? `<img src="\${data.images[0].url}" width="150" style="border-radius:50%"/>` : ''}
    `;
}

// 5. App Lifecycle Handler
window.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('login-btn');
    const fetchBtn = document.getElementById('fetch-btn');
    const contentDiv = document.getElementById('content');

    loginBtn.addEventListener('click', redirectToSpotifyAuth);
    fetchBtn.addEventListener('click', fetchUserProfile);

    // Check if we are handling a redirect callback from Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Exchange code for token, clear URL params, save token
        const token = await getAccessToken(code);
        localStorage.setItem('spotify_access_token', token);
        window.history.replaceState({}, document.title, "/"); // Clean the URL bar
    }

    // Toggle UI visibility based on whether the user is authenticated
    if (localStorage.getItem('spotify_access_token')) {
        loginBtn.classList.add('hidden');
        contentDiv.classList.remove('hidden');
    }
});
