import { useState, useEffect } from 'react';
import { TriangleAlert, Siren, Moon, Sun } from 'lucide-react';
import './App.css';

function App() {
  const [detections, setDetections] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [latestDistance, setLatestDistance] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Fetch detections from PHP backend (NOT SURE SA BACKEND)
  const fetchDetections = async () => {
    try {
      const response = await fetch('/api/save_detection.php');
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tr');
      
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 3) {
          data.push({
            sensor_type: cells[0].textContent.trim(),
            distance: cells[1].textContent.trim(),
            time_detected: cells[2].textContent.trim()
          });
        }
      }
      
      setDetections(data);

      if (data.length > 0) {
        const latest = data[0];
        setLatestDistance(latest.distance);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching detections:', error);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(() => {
      fetchDetections();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      {showAlert && (
        <div className="alert">
          <TriangleAlert /> Intruder Alert! Distance: {latestDistance} cm
        </div>
      )}

      <header className="header">
        <div>
          <h1><Siren /> Intruder Scanner</h1>
          <p>A real-time intruder detection system</p>
        </div>
        <button 
          className="dark-mode-toggle" 
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="dashboard">
        <div className="card">
          <h3>Total Detections</h3>
          <div className="value">{detections.length}</div>
        </div>

        <div className="card">
          <h3>Latest Distance</h3>
          <div className="value">
            {detections.length > 0 ? `${detections[0].distance} cm` : '--'}
          </div>
        </div>

        <div className="card">
          <h3>Status</h3>
          <div className="value status">
            {detections.length > 0 ? 'ACTIVE' : 'MONITORING'}
          </div>
        </div>
      </div>

      <div className="log">
        <div className="log-header">
          <h2>Detection Log</h2>
          <button onClick={fetchDetections}>Refresh</button>
        </div>

        {detections.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sensor Type</th>
                <th>Distance</th>
                <th>Time Detected</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((detection, index) => (
                <tr key={index}>
                  <td>{detection.sensor_type}</td>
                  <td>{detection.distance} cm</td>
                  <td>{detection.time_detected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No detections yet</p>
        )}
      </div>
    </div>
  );
}

export default App;