import { useState, useEffect } from 'react';
import { TriangleAlert, Siren, Moon, Sun } from 'lucide-react';
import './App.css';

function App() {
  // Keep your existing states
  const [showAlert, setShowAlert] = useState(false);
  const [latestDistance, setLatestDistance] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [logs, setLogs] = useState([]);

  // Dark Mode Feature
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);


  const fetchDetections = async () => {
    try {
      const response = await fetch('http://localhost/ArduinoStuff/IntruderScanner/intruder_api.php');
      const data = await response.json();
      
      console.log('Logs:', data);
      setLogs(data);

      // Show alert if there's a new detection
      if (data.length > 0) {
        const latest = data[0];
        setLatestDistance(latest.distance);
        setShowAlert(true);
        
        // Hide alert after 3 seconds
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDetections();

    // Auto-refresh every 5 seconds
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
          <div className="value">{logs.length}</div>
        </div>

        <div className="card">
          <h3>Latest Distance</h3>
          <div className="value">
            {logs.length > 0 ? `${logs[0].distance} cm` : '--'}
          </div>
        </div>

        <div className="card">
          <h3>Status</h3>
          <div className="value status">
            {logs.length > 0 ? 'ACTIVE' : 'MONITORING'}
          </div>
        </div>
      </div>

      <div className="log">
        <div className="log-header">
          <h2>Detection Log</h2>
          <button onClick={fetchDetections}>Refresh</button>
        </div>

        <div className='flex flex-col'>
          {logs.length === 0 ? (
            <p className='no-data'>No Detections Yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className='log-item'>
                <p><strong>ID:</strong> {log.id}</p>
                <p><strong>Sensor:</strong> {log.sensor_type}</p>
                <p><strong>Distance:</strong> {log.distance} cm</p>
                <p><strong>Time:</strong> {log.time_detected}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;