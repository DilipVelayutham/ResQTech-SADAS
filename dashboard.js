const firebaseConfig = {
  apiKey: "AIzaSyDDrgUn-Z239VXW96lBgy9BCaG0HAF0Z4U",
  authDomain: "smartaccidentdetection-29f6a.firebaseapp.com",
  databaseURL: "https://smartaccidentdetection-29f6a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartaccidentdetection-29f6a",
  storageBucket: "smartaccidentdetection-29f6a.appspot.com",
  messagingSenderId: "1068721193208",
  appId: "1:1068721193208:web:6d7b62f0ec724a53d0fb0d"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
function fetchAccidentData() {

    database.ref("accidents").on("value", snapshot => {
        const data = snapshot.val();
        if (data) {
            accidentData.length = 0; 
            data.forEach(item => {
                accidentData.push(item);
            });
            refreshDashboard();
        }
    });
}
let map;
let markers = [];
const accidentData = [];

function initMap() {
    map = L.map('map').setView([12.9716, 77.5946], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    addAllMarkers();
}
function addAllMarkers() {
    accidentData.forEach((data, index) => {
        const marker = L.marker([data.latitude, data.longitude])
            .addTo(map)
            .bindPopup(`
    <b>Accident Alert</b><br>
    Date: ${data.date}<br>
    Time: ${data.time}<br>
    Status: ${data.status}<br>
    Severity: ${data.severity}
`);
        markers.push(marker);
    });
}
function focusMarker(index) {
    const data = accidentData[index];
    map.setView([data.latitude, data.longitude], 14);
    markers[index].openPopup();
}
function loadAccidentData() {
    const table = document.getElementById("accidentTable");
    table.innerHTML = ""; // clear old rows

    accidentData.forEach((data, index) => {
        const row = document.createElement("tr");

        const statusClass =
            data.status === "Alert Sent" ? "alert" :
            data.status === "Cancelled" ? "cancelled" : "alert";

        row.innerHTML = `
            <td>${data.date}</td>
            <td>${data.time}</td>
            <td>${data.latitude}</td>
            <td>${data.longitude}</td>
            <td>
    <span class="severity ${data.severity.toLowerCase()}">
        ${data.severity}
    </span>
</td>

            <td>
                <span class="status ${statusClass}">
                    ${data.status}
                </span>
            </td><td>
    <button class="action-btn alert"
        onclick="event.stopPropagation(); sendEmergencyAlert(${index})">
        Send Alert
    </button>

    <button class="action-btn resolve"
        onclick="event.stopPropagation(); resolveAccident(${index})">
        Resolve
    </button>

    <button class="action-btn cancel"
        onclick="event.stopPropagation(); cancelAccident(${index})">
        Cancel
    </button>

    <button class="action-btn navigate"
        onclick="event.stopPropagation(); navigateToHospital(${index})">
        Navigate
    </button>
</td>

            
        `;
        row.onclick = () => focusMarker(index);

        table.appendChild(row);
    });
}

function updateSummary() {
    document.getElementById("totalCount").innerText = accidentData.length;
    document.getElementById("alertCount").innerText =
        accidentData.filter(a => a.status === "Alert Sent").length;
    document.getElementById("cancelledCount").innerText =
        accidentData.filter(a => a.status === "Cancelled").length;
}
window.onload = () => {
    initMap();
    fetchAccidentData();
    loadChart();
};


function resolveAccident(index) {
    accidentData[index].status = "Resolved";
    uploadAccidentData();
    refreshDashboard();
}

function cancelAccident(index) {
    accidentData[index].status = "Cancelled";
    uploadAccidentData();
    refreshDashboard();
}


function refreshDashboard() {
    document.getElementById("accidentTable").innerHTML = "";
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    loadAccidentData();
    addAllMarkers();
    updateSummary();
}
function showAlertNotification() {
    const popup = document.getElementById("alertPopup");
    const sound = document.getElementById("alertSound");

    popup.classList.add("show");
    sound.play();

    setTimeout(() => {
        popup.classList.remove("show");
    }, 4000);
}
document.addEventListener("click", () => {
    const sound = document.getElementById("alertSound");
    sound.play().then(() => sound.pause());
}, { once: true });
function navigateToHospital(index) {
    const data = accidentData[index];

    const lat = data.latitude;
    const lng = data.longitude;

    const googleMapsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    window.open(googleMapsUrl, "_blank");
}
function sendEmergencyAlert(index) {

    const data = accidentData[index];

    const message = `
EMERGENCY ALERT 🚨
Location: ${data.latitude}, ${data.longitude}
Severity: ${data.severity}
Status: Accident Detected
`;
accidentData[index].status = "Alert Sent";
uploadAccidentData();
refreshDashboard();

alert("Emergency Alert Sent Successfully!");
    console.log(message);
    showAlertNotification();
}
let chart;

function loadChart() {

    const alertCount =
        accidentData.filter(a => a.status === "Alert Sent").length;

    const cancelledCount =
        accidentData.filter(a => a.status === "Cancelled").length;

    const resolvedCount =
        accidentData.filter(a => a.status === "Resolved").length;

    const ctx = document.getElementById("accidentChart");

    if (!ctx) return;

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Alert Sent", "Cancelled", "Resolved"],
            datasets: [{
                label: "Accidents",
                data: [alertCount, cancelledCount, resolvedCount]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Smart Accident Detection Report", 20, 20);
    let y = 35;
    accidentData.forEach((data, index) => {
        doc.setFontSize(11);
        doc.text(
            `${index + 1}. Date: ${data.date} | Time: ${data.time}`,
            20, y
        );
        y += 8;
        doc.text(
            `Location: ${data.latitude}, ${data.longitude}`,
            20, y
        );
        y += 8;
        doc.text(
            `Severity: ${data.severity} | Status: ${data.status}`,
            20, y
        );
        y += 12;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });
    doc.save("Accident_Report.pdf");
}
function uploadAccidentData() {
    database.ref("accidents").set(accidentData);
}
