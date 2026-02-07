from flask import Flask, render_template, request, jsonify
import os, json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

LEADERBOARD_FILE = os.path.join(BASE_DIR, "leaderboard.json")

def load_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, "r") as f:
            return json.load(f)
    return {}

def save_leaderboard(data):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ---------- PAGES ----------

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/focus")
def focus():
    return render_template("focus.html")

@app.route("/leaderboard-page")
def leaderboard_page():
    return render_template("leaderboard.html")

# ---------- API ----------

@app.route("/save_score", methods=["POST"])
def save_score():
    data = request.json
    username = data["username"]
    points = data["points"]

    lb = load_leaderboard()
    lb[username] = lb.get(username, 0) + points
    save_leaderboard(lb)

    return jsonify({"status": "ok"})

@app.route("/leaderboard")
def leaderboard():
    lb = load_leaderboard()
    sorted_lb = sorted(lb.items(), key=lambda x: x[1], reverse=True)
    return jsonify(sorted_lb)

if __name__ == "__main__":
    app.run(debug=True)
