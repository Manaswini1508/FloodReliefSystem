import sqlite3
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

app = Flask(__name__)
CORS(app)

# -------- DATABASE --------
conn = sqlite3.connect('data.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS history (
    injured INT,
    houses INT,
    water INT,
    food INT,
    result TEXT
)
''')
conn.commit()

# -------- DATA --------
data = {
    "injured": [50, 20, 5, 70, 30, 2, 55, 25, 8],
    "houses_damaged": [80, 40, 10, 100, 50, 5, 75, 35, 12],
    "water_left": [20, 60, 80, 10, 40, 90, 15, 50, 85],
    "food_left": [30, 50, 70, 20, 45, 85, 25, 55, 75],
    "priority": ["High", "Medium", "Low", "High", "Medium", "Low", "High", "Medium", "Low"]
}

df = pd.DataFrame(data)
X = df[["injured", "houses_damaged", "water_left", "food_left"]]
y = df["priority"]

model = DecisionTreeClassifier()
model.fit(X, y)

# -------- HOME ROUTE --------
@app.route("/")
def home():
    return "Flood Relief API Running 🚀"

# -------- PREDICT --------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        inj = int(data['injured'])
        house = int(data['houses'])
        water = int(data['water'])
        food = int(data['food'])

        user_input = [[inj, house, water, food]]
        result = model.predict(user_input)[0]

        # SAVE DATA
        cursor.execute(
            "INSERT INTO history VALUES (?, ?, ?, ?, ?)",
            (inj, house, water, food, result)
        )
        conn.commit()

        return jsonify({"priority": result})

    except Exception as e:
        return jsonify({"error": str(e)})

# -------- HISTORY --------
@app.route('/history', methods=['GET'])
def history():
    cursor.execute("SELECT * FROM history")
    data = cursor.fetchall()
    return jsonify(data)

# -------- RUN (IMPORTANT FIX) --------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))   # Railway dynamic port
    app.run(host="0.0.0.0", port=port)
