# The Chase – Online

The host opens the site and gets an invite link. Friends open the link (no account needed), pick Team 1, Team 2, Chaser or Watching, and play from their own phones.

## Run it on your computer
    npm install
    npm start
Open http://localhost:3000 (host). Use a tunnel such as cloudflared or ngrok to let friends reach it.

## Put it online for free (Render)
1. Upload these four files to a GitHub repository.
2. On render.com choose New > Web Service and pick the repository.
3. Build command: `npm install`  Start command: `npm start`  Instance: Free.
4. Open the address Render gives you. That page is the host page: it creates a room and shows the invite link. Send that link in Discord.

## Notes
- The host's browser runs the game. Keep that tab open; reloading it closes the room.
- Players answer for their team or the Chaser. The host picks offers and clicks Next.
- Free hosting sleeps when idle, so the first load can take about a minute.
- Rooms live in memory and disappear when the host leaves.
