const setup = document.getElementById("setup");
const session = document.getElementById("session");
const endScreen = document.getElementById("end");

const timerEl = document.getElementById("timer");
const violationsEl = document.getElementById("violations");
const lectureFrame = document.getElementById("lectureFrame");
const musicEl = document.getElementById("focusMusic");
const musicToggleEl = document.getElementById("musicToggle");


let timeLeft = 0;
let interval = null;
let violations = 0;
let sessionActive = false;

const MAX_VIOLATIONS = 3;
let lastViolationTime = 0;
const COOLDOWN = 3000;

// fullscreen
function requestFullscreen() {
    document.documentElement.requestFullscreen?.();
}

// tab switch detect
document.addEventListener("visibilitychange", () => {
    if (sessionActive && document.hidden) {
        registerViolation("Tab switched");
    }
});

function registerViolation(reason) {
    const now = Date.now();
    if (now - lastViolationTime < COOLDOWN) return;
    lastViolationTime = now;

    violations++;
    violationsEl.innerText = `Violations: ${violations} (${reason})`;

    if (violations >= MAX_VIOLATIONS) {
        failSession();
    }
}

function failSession() {
    clearInterval(interval);
    alert("❌ SESSION FAILED");
    location.reload();
    musicEl.pause();
    musicEl.currentTime = 0;

}

function startSession() {
    const username = document.getElementById("username").value.trim();
    const minutes = parseInt(document.getElementById("duration").value);
    const url = document.getElementById("lectureUrl").value.trim();
	// start music if selected
	if (musicToggleEl.checked) {
   	 musicEl.volume = 0.6;
    	musicEl.play().catch(() => {
        	alert("Tap once on screen to allow music (mobile browser rule)");
    	});
}


    if (!username || !minutes || minutes < 1 || !url) {
        alert("Fill all fields");
        return;
    }

    setup.classList.add("hidden");
    session.classList.remove("hidden");

    sessionActive = true;
    requestFullscreen();

    lectureFrame.src = convertToEmbed(url);

    timeLeft = minutes * 60;
    timerEl.innerText = format(timeLeft);

    interval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = format(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(interval);
            sessionActive = false;

            session.classList.add("hidden");
            endScreen.classList.remove("hidden");

            fetch("/save_score", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: username,
                    points: minutes * 10
                })
            });
        }
    }, 1000);
}

function format(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2,"0")}`;
}

function convertToEmbed(url) {
    try {
        // youtube watch link
        if (url.includes("youtube.com/watch")) {
            const id = new URL(url).searchParams.get("v");
            return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1`;
        }

        // youtu.be short link
        if (url.includes("youtu.be")) {
            const id = url.split("youtu.be/")[1].split("?")[0];
            return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1`;
        }

        // already embed
        if (url.includes("youtube.com/embed")) {
            return url;
        }

        // fallback (non-youtube)
        return url;
    } catch (e) {
        alert("Invalid YouTube link");
        return "";
    }
}

document.addEventListener("touchstart", () => {
    if (musicToggleEl.checked && musicEl.paused) {
        musicEl.play().catch(() => {});
    }
}, { once: true });

