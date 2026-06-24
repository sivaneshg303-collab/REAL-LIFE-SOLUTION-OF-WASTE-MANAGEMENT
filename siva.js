
// 1. Login Page Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');

        if (username === 'sivanesh' && password === '12345678') {
            errorMsg.textContent = "";
            window.location.href = 'dashboard.html'; 
        } else {
            errorMsg.textContent = "Invalid username or password!";
        }
    });
}

let map, marker;
// Storing Leaflet marker objects for each district to open popups programmatically
const mapMarkers = {}; 

// Complete Data for all 38 Districts of Tamil Nadu with mock waste levels (in Tons)
// Assuming Maximum Capacity for a district is 6000 Tons to calculate percentages
const districtWasteData = [
    { name: "Ariyalur", lat: 11.1411, lon: 79.0706, waste: 450 },
    { name: "Chengalpattu", lat: 12.6841, lon: 79.9836, waste: 1800 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707, waste: 5400 },
    { name: "Coimbatore", lat: 11.0168, lon: 76.9558, waste: 4200 },
    { name: "Cuddalore", lat: 11.7480, lon: 79.7714, waste: 1100 },
    { name: "Dharmapuri", lat: 12.1211, lon: 78.1582, waste: 650 },
    { name: "Dindigul", lat: 10.3673, lon: 77.9803, waste: 950 },
    { name: "Erode", lat: 11.3410, lon: 77.7172, waste: 1400 },
    { name: "Kallakurichi", lat: 11.7383, lon: 78.9639, waste: 500 },
    { name: "Kancheepuram", lat: 12.8342, lon: 79.7036, waste: 1300 },
    { name: "Kanyakumari", lat: 8.0883, lon: 77.5385, waste: 850 },
    { name: "Karur", lat: 10.9601, lon: 78.0766, waste: 700 },
    { name: "Krishnagiri", lat: 12.5186, lon: 78.2137, waste: 800 },
    { name: "Madurai", lat: 9.9252, lon: 78.1198, waste: 3100 },
    { name: "Mayiladuthurai", lat: 11.1018, lon: 79.6522, waste: 400 },
    { name: "Nagapattinam", lat: 10.7656, lon: 79.8424, waste: 550 },
    { name: "Namakkal", lat: 11.2189, lon: 78.1673, waste: 750 },
    { name: "Nilgiris", lat: 11.4167, lon: 76.7000, waste: 350 },
    { name: "Perambalur", lat: 11.2342, lon: 78.8784, waste: 300 },
    { name: "Pudukkottai", lat: 10.3833, lon: 78.8167, waste: 680 },
    { name: "Ramanathapuram", lat: 9.3639, lon: 78.8394, waste: 600 },
    { name: "Ranipet", lat: 12.9279, lon: 79.3327, waste: 900 },
    { name: "Salem", lat: 11.6518, lon: 78.1573, waste: 2700 },
    { name: "Sivaganga", lat: 9.8433, lon: 78.4833, waste: 580 },
    { name: "Tenkasi", lat: 8.9593, lon: 77.3142, waste: 620 },
    { name: "Thanjavur", lat: 10.7870, lon: 79.1378, waste: 1250 },
    { name: "Theni", lat: 10.0104, lon: 77.4768, waste: 720 },
    { name: "Thoothukudi", lat: 8.7642, lon: 78.1348, waste: 1450 },
    { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, waste: 2600 },
    { name: "Tirunelveli", lat: 8.7139, lon: 77.7567, waste: 1600 },
    { name: "Tirupathur", lat: 12.4934, lon: 78.5678, waste: 480 },
    { name: "Tiruppur", lat: 11.1085, lon: 77.3411, waste: 2200 },
    { name: "Tiruvallur", lat: 13.1394, lon: 79.9072, waste: 1950 },
    { name: "Tiruvannamalai", lat: 12.2280, lon: 79.0666, waste: 880 },
    { name: "Tiruvarur", lat: 10.7725, lon: 79.6361, waste: 520 },
    { name: "Vellore", lat: 12.9165, lon: 79.1325, waste: 1550 },
    { name: "Viluppuram", lat: 11.9401, lon: 79.4861, waste: 1050 },
    { name: "Virudhunagar", lat: 9.5680, lon: 77.9624, waste: 890 }
];

// Helper function to return alert boundary colors
function getColor(wasteLevel) {
    return wasteLevel > 3000 ? '#ff0000' :
           wasteLevel > 1500 ? '#ffaa00' :
                               '#00ff00';
}

// Map initialization
function initMap() {
    if (document.getElementById('map')) {
        const tamilNaduBounds = L.latLngBounds(
            L.latLng([8.0000, 75.9000]), 
            L.latLng([13.6000, 80.5000])
        );

        map = L.map('map', {
            center: [11.1271, 78.6569], 
            zoom: 7,                     
            minZoom: 7,                  
            maxZoom: 18,                 
            maxBounds: tamilNaduBounds,  
            maxBoundsViscosity: 1.0      
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Populate Dropdown Options & Place Map Markers Dynamically
        const dropdown = document.getElementById('districtSelect');

        districtWasteData.forEach(district => {
            // A. Populate HTML Dropdown list
            const option = document.createElement('option');
            option.value = district.name;
            option.textContent = district.name;
            dropdown.appendChild(option);

            // B. Add Circle Marker onto Map
            const circle = L.circleMarker([district.lat, district.lon], {
                radius: 12,
                fillColor: getColor(district.waste),
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: Arial, sans-serif;">
                    <h4 style="margin:0 0 5px 0;">${district.name} District</h4>
                    <p style="margin:0;"><b>Waste Produced:</b> ${district.waste} Tons/day</p>
                </div>
            `);

            // Save circle instance references mapped to their district names
            mapMarkers[district.name] = circle;
        });
    }
}

// Function triggered when dropdown selection changes
function onDistrictChange() {
    const selectedDistrictName = document.getElementById('districtSelect').value;
    const statsContainer = document.getElementById('statsContainer');

    // If placeholder "-- Select District --" is chosen, hide data cards
    if (!selectedDistrictName) {
        statsContainer.style.display = "none";
        map.setView([11.1271, 78.6569], 7); // reset map view to full state
        return;
    }

    // Find corresponding data object matching chosen name
    const districtData = districtWasteData.find(d => d.name === selectedDistrictName);

    if (districtData) {
        // 1. Zoom and Pan Map view directly onto selected district
        map.setView([districtData.lat, districtData.lon], 11);
        
        // 2. Programmatically trigger click popup open event on the marker
        mapMarkers[selectedDistrictName].openPopup();

        // 3. Compute metric percentages (Max system constraint threshold: 6000 Tons)
        const maxCapacity = 6000;
        const percentage = Math.round((districtData.waste / maxCapacity) * 100);

        // 4. Update UI labels and unhide data cards container
        document.getElementById('totalWasteVal').textContent = `${districtData.waste} Tons/day`;
        
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
        progressFill.textContent = `${percentage}%`;

        // Adjust progress bar color status explicitly
        if (percentage > 70) {
            progressFill.style.backgroundColor = "#ff0000"; // Red for Danger levels
        } else if (percentage > 35) {
            progressFill.style.backgroundColor = "#ffaa00"; // Orange for Warning
        } else {
            progressFill.style.backgroundColor = "#2ea44f"; // Green for Safe
        }

        statsContainer.style.display = "flex";
    }
}

document.addEventListener("DOMContentLoaded", initMap);

// Live user location tracking routines
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Sorry! Your browser does not support Geolocation.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    map.setView([lat, lon], 15);

    if (marker) { map.removeLayer(marker); }
    marker = L.marker([lat, lon]).addTo(map).bindPopup("<b>You are here!</b>").openPopup();
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED: alert("User denied Geolocation access."); break;
        case error.POSITION_UNAVAILABLE: alert("Location details unavailable."); break;
        case error.TIMEOUT: alert("Geolocation request timed out."); break;
        case error.UNKNOWN_ERROR: alert("Unknown location tracking error occurred."); break;
    }
}