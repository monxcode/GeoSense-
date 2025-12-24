// Configuration
const CONFIG = {
    MAP_CENTER: [24.5854, 73.7125], // Udaipur coordinates
    MAP_ZOOM: 12,
    UPDATE_INTERVAL: 15000, // 15 seconds for simulated updates
    WEATHER_API_KEY: 'e0e63578e29f0d3ac7359000742b5c8f',
    WEATHER_CITY: 'Udaipur,IN'
};

// Global variables
let map;
let markers = [];
let trafficData = [];
let charts = {};
let updateInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize time display
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000);

        // Load traffic data
        await loadTrafficData();
        
        // Initialize map
        initializeMap();
        
        // Initialize charts
        initializeCharts();
        
        // Load weather data
        await loadWeatherData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start simulated real-time updates
        startRealTimeUpdates();
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
    }
}

// Load traffic data from JSON
async function loadTrafficData() {
    try {
        // For demo purposes, we'll use simulated data
        // In production, this would come from data/trafficData.json
        trafficData = generateTrafficData();
        
        // If you have actual JSON file:
        // const response = await fetch('data/trafficData.json');
        // trafficData = await response.json();
        
        updateDashboardStats();
        updateRoadDataTable();
        updateSafeRoutes();
    } catch (error) {
        console.error('Error loading traffic data:', error);
        trafficData = generateTrafficData(); // Fallback to generated data
    }
}

// Generate sample traffic data for Udaipur
function generateTrafficData() {
    const roads = [
        { name: "MG Road", location: [24.5854, 73.7125] },
        { name: "Lake Pichola Road", location: [24.5754, 73.6900] },
        { name: "City Palace Road", location: [24.5760, 73.6800] },
        { name: "Fateh Sagar Road", location: [24.5925, 73.6746] },
        { name: "Hiran Magri Road", location: [24.5550, 73.6800] },
        { name: "Sukhadia Circle", location: [24.5800, 73.7000] },
        { name: "Airport Road", location: [24.6200, 73.8961] },
        { name: "Udai Marg", location: [24.5700, 73.7100] },
        { name: "Bapu Bazaar Road", location: [24.5780, 73.6830] },
        { name: "Sajjan Niwas Road", location: [24.5900, 73.6950] },
        { name: "Panchwati Road", location: [24.6000, 73.6800] },
        { name: "Delhi Road", location: [24.6100, 73.7300] },
        { name: "Ambamata Road", location: [24.5650, 73.7050] },
        { name: "Shastri Circle", location: [24.5720, 73.6900] },
        { name: "Bhagwat Bhavan Road", location: [24.5950, 73.7100] }
    ];

    return roads.map(road => {
        const congestion = Math.floor(Math.random() * 100);
        const accidents = Math.floor(Math.random() * 4);
        const avgSpeed = 40 - (congestion / 100 * 30) + Math.random() * 10;
        
        return {
            road: road.name,
            location: road.location,
            congestion: Math.max(5, Math.min(95, congestion)),
            accidents: accidents,
            averageSpeed: Math.max(10, Math.min(60, avgSpeed.toFixed(1))),
            lastUpdated: new Date().toISOString(),
            safetyScore: calculateSafetyScore(congestion, accidents)
        };
    });
}

// Calculate safety score
function calculateSafetyScore(congestion, accidents) {
    let score = 100;
    score -= congestion * 0.3; // Congestion impact
    score -= accidents * 15;   // Accident impact
    return Math.max(0, Math.min(100, score));
}

// Initialize Leaflet map
function initializeMap() {
    map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add traffic layer
    addTrafficMarkers();
    
    // Add map controls
    L.control.scale().addTo(map);
}

// Add traffic markers to map
function addTrafficMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    trafficData.forEach(road => {
        const congestion = road.congestion;
        let color;
        
        if (congestion <= 30) color = 'green';
        else if (congestion <= 70) color = 'yellow';
        else color = 'red';
        
        // Create custom icon
        const icon = L.divIcon({
            className: `congestion-marker ${color}`,
            html: `
                <div class="w-8 h-8 rounded-full bg-${color}-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <span class="text-white font-bold text-xs">${Math.round(congestion)}</span>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        const marker = L.marker(road.location, { icon })
            .addTo(map)
            .bindPopup(createPopupContent(road));
        
        markers.push(marker);
    });
}

// Create popup content for markers
function createPopupContent(road) {
    const safetyLevel = getSafetyLevel(road.safetyScore);
    const safetyClass = `safety-${safetyLevel}`;
    
    return `
        <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-lg mb-2">${road.road}</h3>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Congestion:</span>
                    <span class="font-bold ${getCongestionColorClass(road.congestion)}">
                        ${road.congestion}%
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Accidents:</span>
                    <span class="font-bold ${road.accidents > 0 ? 'text-red-600' : 'text-green-600'}">
                        ${road.accidents} today
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Avg Speed:</span>
                    <span class="font-bold text-blue-600">${road.averageSpeed} km/h</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Safety:</span>
                    <span class="font-bold ${safetyClass}">
                        ${safetyLevel.toUpperCase()}
                    </span>
                </div>
            </div>
            <hr class="my-2">
            <div class="text-xs text-gray-500">
                Updated: ${new Date(road.lastUpdated).toLocaleTimeString()}
            </div>
        </div>
    `;
}

// Initialize charts
function initializeCharts() {
    // Congestion Trends Chart
    const congestionCtx = document.getElementById('congestion-chart').getContext('2d');
    charts.congestion = new Chart(congestionCtx, {
        type: 'line',
        data: {
            labels: ['4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'],
            datasets: [{
                label: 'Average Congestion',
                data: [20, 65, 45, 75, 85, 40],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Congestion (%)'
                    }
                }
            }
        }
    });
    
    // Accident Hotspots Chart
    const accidentsCtx = document.getElementById('accidents-chart').getContext('2d');
    const accidentRoads = [...trafficData]
        .filter(road => road.accidents > 0)
        .sort((a, b) => b.accidents - a.accidents)
        .slice(0, 5);
    
    charts.accidents = new Chart(accidentsCtx, {
        type: 'bar',
        data: {
            labels: accidentRoads.map(road => road.road.substring(0, 15) + (road.road.length > 15 ? '...' : '')),
            datasets: [{
                label: 'Accidents Today',
                data: accidentRoads.map(road => road.accidents),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Accidents'
                    }
                }
            }
        }
    });
    
    // Peak Hours Chart
    const peakHoursCtx = document.getElementById('peak-hours-chart').getContext('2d');
    charts.peakHours = new Chart(peakHoursCtx, {
        type: 'bar',
        data: {
            labels: ['12-2 AM', '2-4 AM', '4-6 AM', '6-8 AM', '8-10 AM', '10-12 PM', '12-2 PM', '2-4 PM', '4-6 PM', '6-8 PM', '8-10 PM', '10-12 PM'],
            datasets: [{
                label: 'Traffic Volume',
                data: [5, 3, 8, 25, 45, 30, 25, 35, 55, 40, 25, 15],
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Traffic Volume'
                    }
                }
            }
        }
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalCongestion = trafficData.reduce((sum, road) => sum + road.congestion, 0);
    const avgCongestion = Math.round(totalCongestion / trafficData.length);
    const totalAccidents = trafficData.reduce((sum, road) => sum + road.accidents, 0);
    const avgSpeed = trafficData.reduce((sum, road) => sum + parseFloat(road.averageSpeed), 0) / trafficData.length;
    const safeRoutes = trafficData.filter(road => road.safetyScore >= 70).length;
    
    document.getElementById('avg-congestion').textContent = `${avgCongestion}%`;
    document.getElementById('total-accidents').textContent = totalAccidents;
    document.getElementById('avg-speed').textContent = `${avgSpeed.toFixed(1)} km/h`;
    document.getElementById('safe-routes').textContent = safeRoutes;
    
    // Update congestion color
    const congestionElement = document.getElementById('avg-congestion');
    congestionElement.className = `text-2xl font-bold ${getCongestionColorClass(avgCongestion)}`;
}

// Update road data table
function updateRoadDataTable() {
    const tbody = document.getElementById('road-data');
    tbody.innerHTML = '';
    
    trafficData.forEach(road => {
        const safetyLevel = getSafetyLevel(road.safetyScore);
        const safetyClass = `safety-${safetyLevel}`;
        const statusClass = getStatusClass(road.congestion);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-900">${road.road}</td>
            <td class="px-4 py-3">
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div class="h-2.5 rounded-full ${getCongestionColorClass(road.congestion, 'bg')}" 
                             style="width: ${road.congestion}%"></div>
                    </div>
                    <span>${road.congestion}%</span>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="${road.accidents > 0 ? 'text-red-600 font-bold' : 'text-green-600'}">
                    ${road.accidents}
                </span>
            </td>
            <td class="px-4 py-3 font-medium">${road.averageSpeed} km/h</td>
            <td class="px-4 py-3">
                <span class="${statusClass}">
                    ${getStatusText(road.congestion)}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="${safetyClass}">
                    ${safetyLevel.toUpperCase()} (${Math.round(road.safetyScore)})
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update safe routes list
function updateSafeRoutes() {
    const container = document.getElementById('safe-routes-list');
    const safeRoutes = trafficData
        .filter(road => road.safetyScore >= 70)
        .sort((a, b) => b.safetyScore - a.safetyScore)
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (safeRoutes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No safe routes available</p>';
        return;
    }
    
    safeRoutes.forEach(road => {
        const routeCard = document.createElement('div');
        routeCard.className = 'safe-route-card bg-gray-50 p-4 rounded-lg';
        routeCard.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-gray-800">${road.road}</h4>
                    <div class="flex items-center text-sm text-gray-600 mt-1">
                        <span class="mr-4">
                            <i class="fas fa-car mr-1"></i> ${road.averageSpeed} km/h
                        </span>
                        <span>
                            <i class="fas fa-shield-alt mr-1"></i> Safety: ${Math.round(road.safetyScore)}/100
                        </span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-green-600">${road.congestion}%</div>
                    <div class="text-xs text-gray-500">congestion</div>
                </div>
            </div>
        `;
        container.appendChild(routeCard);
    });
}

// Load weather data
async function loadWeatherData() {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.WEATHER_CITY}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error loading weather:', error);
        document.getElementById('weather-info').innerHTML = `
            <div class="text-gray-600">
                <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                Weather data temporarily unavailable
            </div>
        `;
    }
}

// Update weather display
function updateWeatherDisplay(weatherData) {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main;
    const humidity = weatherData.main.humidity;
    
    let weatherIcon = 'fa-cloud';
    if (condition.includes('Clear')) weatherIcon = 'fa-sun';
    if (condition.includes('Rain')) weatherIcon = 'fa-cloud-rain';
    if (condition.includes('Snow')) weatherIcon = 'fa-snowflake';
    if (condition.includes('Cloud')) weatherIcon = 'fa-cloud';
    
    const weatherHTML = `
        <div class="flex items-center">
            <i class="fas ${weatherIcon} weather-icon text-blue-500"></i>
            <div>
                <div class="font-bold text-lg">${temp}°C</div>
                <div class="text-gray-600">${condition}</div>
                <div class="text-sm text-gray-500">
                    Humidity: ${humidity}% | Visibility: ${(weatherData.visibility / 1000).toFixed(1)} km
                </div>
                <div class="text-xs text-gray-400 mt-1">
                    Last updated: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('weather-info').innerHTML = weatherHTML;
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        simulateRealTimeUpdate();
        this.classList.add('updating');
        setTimeout(() => this.classList.remove('updating'), 1000);
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-road');
    const autocompleteResults = document.getElementById('autocomplete-results');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            autocompleteResults.style.display = 'none';
            return;
        }
        
        const matches = trafficData.filter(road => 
            road.road.toLowerCase().includes(query)
        );
        
        if (matches.length > 0) {
            autocompleteResults.innerHTML = matches.map(road => 
                `<div onclick="selectRoad('${road.road}')">${road.road}</div>`
            ).join('');
            autocompleteResults.style.display = 'block';
        } else {
            autocompleteResults.style.display = 'none';
        }
    });
    
    // Filter functionality
    document.querySelectorAll('.congestion-filter, .accident-filter').forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#search-road') && !e.target.closest('#autocomplete-results')) {
            autocompleteResults.style.display = 'none';
        }
    });
}

// Apply filters to map and table
function applyFilters() {
    const congestionFilters = Array.from(document.querySelectorAll('.congestion-filter:checked'))
        .map(cb => cb.value);
    
    const accidentFilters = Array.from(document.querySelectorAll('.accident-filter:checked'))
        .map(cb => cb.value);
    
    // Filter markers
    markers.forEach((marker, index) => {
        const road = trafficData[index];
        let visible = true;
        
        // Check congestion filter
        if (road.congestion <= 30 && !congestionFilters.includes('low')) visible = false;
        if (road.congestion > 30 && road.congestion <= 70 && !congestionFilters.includes('medium')) visible = false;
        if (road.congestion > 70 && !congestionFilters.includes('high')) visible = false;
        
        // Check accident filter
        if (road.accidents === 0 && !accidentFilters.includes('0')) visible = false;
        if (road.accidents > 0 && !accidentFilters.includes('1+')) visible = false;
        
        if (visible) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Select road from autocomplete
function selectRoad(roadName) {
    document.getElementById('search-road').value = roadName;
    document.getElementById('autocomplete-results').style.display = 'none';
    
    const road = trafficData.find(r => r.road === roadName);
    if (road) {
        map.setView(road.location, 15);
        
        // Highlight the marker
        const marker = markers[trafficData.indexOf(road)];
        marker.openPopup();
        
        // Add bounce animation
        marker.setIcon(L.divIcon({
            className: 'congestion-marker selected',
            html: `
                <div class="w-10 h-10 rounded-full bg-blue-500 border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                    <span class="text-white font-bold text-sm">${Math.round(road.congestion)}</span>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        }));
        
        // Reset after 3 seconds
        setTimeout(() => {
            const congestion = road.congestion;
            let color = congestion <= 30 ? 'green' : congestion <= 70 ? 'yellow' : 'red';
            marker.setIcon(L.divIcon({
                className: `congestion-marker ${color}`,
                html: `
                    <div class="w-8 h-8 rounded-full bg-${color}-500 border-2 border-white shadow-lg flex items-center justify-center">
                        <span class="text-white font-bold text-xs">${Math.round(congestion)}</span>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            }));
        }, 3000);
    }
}

// Simulate real-time updates
function simulateRealTimeUpdate() {
    trafficData.forEach(road => {
        // Randomly adjust congestion (-10% to +10%)
        const change = (Math.random() * 20 - 10);
        road.congestion = Math.max(5, Math.min(95, road.congestion + change));
        
        // Randomly adjust speed
        road.averageSpeed = Math.max(10, Math.min(60, 
            parseFloat(road.averageSpeed) + (Math.random() * 4 - 2)
        ));
        
        // Small chance of accident occurring
        if (Math.random() < 0.02) {
            road.accidents++;
        }
        
        // Update safety score
        road.safetyScore = calculateSafetyScore(road.congestion, road.accidents);
        road.lastUpdated = new Date().toISOString();
    });
    
    // Update all displays
    updateDashboardStats();
    updateRoadDataTable();
    updateSafeRoutes();
    addTrafficMarkers();
    
    // Update charts with new data
    updateCharts();
}

// Start real-time updates
function startRealTimeUpdates() {
    updateInterval = setInterval(simulateRealTimeUpdate, CONFIG.UPDATE_INTERVAL);
}

// Update charts with new data
function updateCharts() {
    // Update accidents chart
    const accidentRoads = [...trafficData]
        .filter(road => road.accidents > 0)
        .sort((a, b) => b.accidents - a.accidents)
        .slice(0, 5);
    
    charts.accidents.data.labels = accidentRoads.map(road => 
        road.road.substring(0, 15) + (road.road.length > 15 ? '...' : '')
    );
    charts.accidents.data.datasets[0].data = accidentRoads.map(road => road.accidents);
    charts.accidents.update();
    
    // Update congestion chart with random fluctuation
    const oldData = charts.congestion.data.datasets[0].data;
    const newValue = trafficData.reduce((sum, road) => sum + road.congestion, 0) / trafficData.length;
    
    // Shift data and add new value
    oldData.shift();
    oldData.push(Math.round(newValue));
    
    charts.congestion.update();
}

// Helper functions
function getCongestionColorClass(congestion, prefix = 'text') {
    if (congestion <= 30) return `${prefix}-green-600`;
    if (congestion <= 70) return `${prefix}-yellow-600`;
    return `${prefix}-red-600`;
}

function getSafetyLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'poor';
}

function getStatusClass(congestion) {
    if (congestion <= 30) return 'status-smooth';
    if (congestion <= 70) return 'status-moderate';
    return 'status-heavy';
}

function getStatusText(congestion) {
    if (congestion <= 30) return 'Smooth';
    if (congestion <= 70) return 'Moderate';
    return 'Heavy';
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = 
        now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50';
    alertDiv.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> ${message}</span>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Export functions for global access (for inline onclick handlers)
window.selectRoad = selectRoad;