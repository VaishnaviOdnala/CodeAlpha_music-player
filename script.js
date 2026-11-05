
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const playlist = document.getElementById("playlist");
const songCount = document.getElementById("songCount");
const statusText = document.getElementById("status");
const cover = document.getElementById("cover");

// Sample audio tracks
const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "Sample Music",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        color: "linear-gradient(135deg, #7c3aed, #ec4899)"
    },
    {
        title: "SoundHelix Song 2",
        artist: "Sample Music",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        color: "linear-gradient(135deg, #0891b2, #6366f1)"
    },
    {
        title: "SoundHelix Song 3",
        artist: "Sample Music",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        color: "linear-gradient(135deg, #ea580c, #db2777)"
    }
];

let songIndex = 0;
let isSeeking = false;

// Format seconds as minutes:seconds
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
}

// Build playlist
function renderPlaylist() {
    playlist.innerHTML = "";

    songs.forEach((song, index) => {
        const item = document.createElement("div");
        item.className = "song";
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Play ${song.title}`);

        item.innerHTML = `
            <span class="song-number">${index + 1}</span>
            <div class="song-details">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <span class="song-state">
                ${index === songIndex && !audio.paused ? "♫" : "▶"}
            </span>
        `;

        item.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        item.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                loadSong(index);
                playSong();
            }
        });

        playlist.appendChild(item);
    });

    songCount.textContent =
        `${songs.length} ${songs.length === 1 ? "song" : "songs"}`;

    updateActiveSong();
}

// Load a song
function loadSong(index) {
    songIndex = (index + songs.length) % songs.length;

    const song = songs[songIndex];

    audio.pause();
    audio.src = song.src;
    audio.load();

    songTitle.textContent = song.title;
    artist.textContent = song.artist;
    cover.style.background = song.color;

    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
    statusText.textContent = "Ready to play";

    updateActiveSong();
}

// Play audio
async function playSong() {
    try {
        await audio.play();
        playBtn.textContent = "❚❚";
        playBtn.setAttribute("aria-label", "Pause");
        statusText.textContent = "Now playing";
        updateActiveSong();
    } catch (error) {
        statusText.textContent =
            "Unable to play audio. Check your internet connection.";
        playBtn.textContent = "▶";
    }
}

// Pause audio
function pauseSong() {
    audio.pause();
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
    statusText.textContent = "Playback paused";
    updateActiveSong();
}

// Play/Pause button
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

// Next and previous buttons
nextBtn.addEventListener("click", () => {
    loadSong((songIndex + 1) % songs.length);
    playSong();
});

prevBtn.addEventListener("click", () => {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        loadSong((songIndex - 1 + songs.length) % songs.length);
        playSong();
    }
});

// Update progress and time
audio.addEventListener("timeupdate", () => {
    if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }

    currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
    // Automatically play the next song
    loadSong((songIndex + 1) % songs.length);
    playSong();
});

// Seek within a song
progress.addEventListener("input", () => {
    isSeeking = true;
    if (Number.isFinite(audio.duration)) {
        currentTime.textContent = formatTime(
            (Number(progress.value) / 100) * audio.duration
        );
    }
});

progress.addEventListener("change", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
    isSeeking = false;
});

// Volume control
audio.volume = Number(volume.value);

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

// Highlight current playlist song
function updateActiveSong() {
    document.querySelectorAll(".song").forEach((item, index) => {
        item.classList.toggle("active", index === songIndex);

        const state = item.querySelector(".song-state");
        if (state) {
            state.textContent =
                index === songIndex && !audio.paused ? "♫" : "▶";
        }
    });
}

audio.addEventListener("play", updateActiveSong);
audio.addEventListener("pause", updateActiveSong);

// Initialize player
renderPlaylist();
loadSong(0);
