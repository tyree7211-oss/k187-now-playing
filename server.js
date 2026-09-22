const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.text({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));

let nowPlaying = "K187 RADIO — LOCKED IN. TURNED UP.";

// PlayIt Live sends the current song here
app.all("/update", (req, res) => {
  const song =
    req.body?.text ||
    req.body?.song ||
    (typeof req.body === "string" ? req.body : "") ||
    req.query.text ||
    req.query.song;

  if (song && String(song).trim()) {
    nowPlaying = String(song).trim();
    console.log("Now Playing:", nowPlaying);
  }

  res.send("OK");
});

// LIVE Studio checks this for the current song
app.get("/api/nowplaying", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ text: nowPlaying });
});

// K187 overlay
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
    font-family: Arial, sans-serif;
  }

  .overlay {
    display: inline-block;
    background: rgba(13,13,13,.88);
    padding: 14px 22px;
    border-left: 5px solid #00FF5E;
  }

  .label {
    color: #00FF5E;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 3px;
  }

  #song {
    color: #F2F2F2;
    font-size: 26px;
    font-weight: 700;
    margin-top: 5px;
  }
</style>
</head>

<body>

<div class="overlay">
  <div class="label">K187 • NOW PLAYING</div>
  <div id="song">Loading...</div>
</div>

<script>
async function updateSong() {
  try {
    const response = await fetch("/api/nowplaying?t=" + Date.now());
    const data = await response.json();
    document.getElementById("song").textContent = data.text;
  } catch (error) {
    console.error(error);
  }
}

updateSong();
setInterval(updateSong, 2000);
</script>

</body>
</html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("K187 Now Playing server running on port " + PORT);
});
