# GeoSense – Udaipur Traffic & Safety Insights

A smart traffic and safety intelligence dashboard for Udaipur that visualizes movement and traffic data, provides safety insights, and helps users make informed travel decisions.

# Demo

live hare: "https://monxcode.github.io/City-pulse/"

## Features

### 1. Interactive Map
- Display Udaipur roads as color-coded markers
- Color coding based on congestion levels:
  - Green (0-30%): Low congestion
  - Yellow (31-70%): Medium congestion
  - Red (71-100%): High congestion
- Click markers to view detailed popups with road information

### 2. Traffic & Safety Dashboard
- Real-time statistics display
- Multiple charts:
  - Congestion trends over 24 hours
  - Accident hotspots
  - Peak traffic hours analysis
- Safe routes recommendations

### 3. Filters & Search
- Filter by congestion level (Low/Medium/High)
- Filter by accident history
- Search roads by name with autocomplete

### 4. Real-Time Simulation
- Automatic updates every 15 seconds
- Random congestion fluctuations
- Simulated accident occurrences
- Dynamic safety score calculations

### 5. Weather Integration
- Live weather data from OpenWeather API
- Weather impact on traffic insights

## How to Run Locally

1. **Clone or download** the project files
2. **Organize the folder structure**:

3. **Open index.html** in a modern web browser
   - Simply double-click the file, or
   - Use a local server: `python -m http.server 8000` and visit `http://localhost:8000`

## Technologies Used

- **HTML5**: Page structure
- **CSS3/Tailwind CSS**: Styling and responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **Leaflet.js**: Interactive maps
- **Chart.js**: Data visualization
- **Font Awesome**: Icons
- **OpenWeather API**: Weather data

## API Keys Used

1. **OpenWeather API**: `e0e63578e29f0d3ac7359000742b5c8f`
2. **Google Maps API**: Provided but using OpenStreetMap for this demo

## Project Structure

- `index.html`: Main application layout
- `style.css`: Custom styles and Tailwind overrides
- `script.js`: All application logic
- `data/trafficData.json`: Sample traffic data for Udaipur
- `assets/`: (Optional) Icons and images

## Key Functions

### Data Management
- `loadTrafficData()`: Loads and processes traffic data
- `generateTrafficData()`: Creates sample data for demonstration
- `calculateSafetyScore()`: Computes safety scores based on multiple factors

### Visualization
- `initializeMap()`: Sets up Leaflet map with OpenStreetMap
- `addTrafficMarkers()`: Plots roads on map with color coding
- `initializeCharts()`: Creates Chart.js visualizations

### Updates
- `simulateRealTimeUpdate()`: Randomly updates traffic conditions
- `updateDashboardStats()`: Refreshes statistics display
- `updateCharts()`: Updates charts with new data

## Customization

### Add More Roads
Edit `data/trafficData.json` to add more Udaipur roads:
```json
{
  "road": "Road Name",
  "location": [latitude, longitude],
  "congestion": 0-100,
  "accidents": number,
  "averageSpeed": km/h
}

