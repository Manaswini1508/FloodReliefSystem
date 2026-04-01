// 🌊 Predict Function
async function predict() {
    const resultBox = document.getElementById("result");
    resultBox.innerText = "🔄 Predicting...";

    const data = {
        injured: document.getElementById("injured").value,
        houses: document.getElementById("houses").value,
        water: document.getElementById("water").value,
        food: document.getElementById("food").value
    };

    // ✅ Input validation
    if (!data.injured || !data.houses || !data.water || !data.food) {
        resultBox.innerText = "⚠️ Please fill all fields!";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // ✅ Show result
        if (result.priority) {
            resultBox.innerText = "🚨 Priority: " + result.priority;

            // 🎨 Color based output
            if (result.priority === "High") {
                resultBox.style.color = "red";
            } else if (result.priority === "Medium") {
                resultBox.style.color = "orange";
            } else {
                resultBox.style.color = "lightgreen";
            }

        } else {
            resultBox.innerText = "❌ Error: " + result.error;
        }

    } catch (error) {
        resultBox.innerText = "⚠️ Server not running!";
    }
}

// 📜 Load History Function
async function loadHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "Loading history...";

    try {
        const response = await fetch("http://127.0.0.1:5000/history");
        const data = await response.json();

        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<li>No history yet</li>";
            return;
        }

        data.forEach(item => {
            const li = document.createElement("li");

            li.innerHTML = `
📍 Injured: ${item[0]} | Houses: ${item[1]} <br>
💧 Water: ${item[2]} | 🍞 Food: ${item[3]} <br>
🚨 Priority: <b>${item[4]}</b>
`;

            // 🎨 Color highlight
            if (item[4] === "High") li.style.color = "red";
            else if (item[4] === "Medium") li.style.color = "orange";
            else if (item[4] === "High") li.style.color = "red";
            else if (item[4] === "Medium") li.style.color = "orange";
            else li.style.color = "lightgreen";

            list.appendChild(li);
        });

    } catch (error) {
        list.innerHTML = "<li>⚠️ Unable to load history</li>";
    }
}

// 🔄 Auto-load history when page opens
window.onload = function () {
    drawChart(data);
};

// ⏱️ Optional: Auto refresh history every 10 seconds
setInterval(loadHistory, 10000);
function drawChart(data) {
    let high = 0, medium = 0, low = 0;

    data.forEach(item => {
        if (item[4] === "High") high++;
        else if (item[4] === "Medium") medium++;
        else low++;
    });

    const ctx = document.getElementById('chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Relief Priority Count',
                data: [high, medium, low]
            }]
        }
    });
}