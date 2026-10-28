const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const page = fs.readFileSync(path.join(__dirname, 'index.html'));
const srv = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); r.end(page); });
const wss = new WebSocketServer({ server: srv, maxPayload: 65536 });
const rooms = new Map();
const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function code() { let s = ''; for (let i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)]; return rooms.has(s) ? code() : s; }
function send(w, o) { if (w && w.readyState === 1) w.send(JSON.stringify(o)); }
function roster(R) { const o = { t: 'roster', l: [...R.players.values()] }; send(R.host, o); R.players.forEach((_, w) => send(w, o)); }

wss.on('connection', (ws, req) => {
  const u = new URL(req.url, 'http://x');
  let R = null, isHost = false;
  if (u.searchParams.get('host')) {
    R = { code: code(), host: ws, players: new Map(), last: null };
    rooms.set(R.code, R); isHost = true; send(ws, { t: 'hello', code: R.code });
  } else {
    R = rooms.get((u.searchParams.get('room') || '').toUpperCase());
    if (!R) { send(ws, { t: 'err', m: 'Room not found. Ask the host for a new link.' }); return ws.close(); }
  }
  ws.on('message', d => {
    let m; try { m = JSON.parse(d); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    if (isHost) {
      if (m.t === 'state') R.last = m;
      if (['state', 'cue', 'fx'].includes(m.t)) R.players.forEach((_, w) => send(w, m));
    } else if (m.t === 'join') {
      R.players.set(ws, { n: String(m.n || 'Player').slice(0, 20), r: ['t1', 't2', 'c', 's'].includes(m.r) ? m.r : 's' });
      send(ws, R.last || { t: 'wait' }); roster(R);
    } else if (m.t === 'act' && R.players.has(ws)) {
      const p = R.players.get(ws);
      send(R.host, { t: 'act', r: p.r, n: p.n, pick: String(m.pick || '').slice(0, 200) });
    }
  });
  ws.on('close', () => {
    if (isHost) { R.players.forEach((_, w) => { send(w, { t: 'err', m: 'The host left the game.' }); w.close(); }); rooms.delete(R.code); }
    else if (R.players.delete(ws)) roster(R);
  });
});
srv.listen(process.env.PORT || 3000, () => console.log('The Chase is running'));
