async function loadLeaderboard() {
    const res = await fetch("/leaderboard");
    const data = await res.json();

    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    data.forEach((u, i) => {
        list.innerHTML += `
            <div class="leaderboard-row">
                <span>#${i + 1}</span>
                <span>${u[0]}</span>
                <span>${u[1]} pts</span>
            </div>
        `;
    });
}

setInterval(loadLeaderboard, 3000);
loadLeaderboard();
