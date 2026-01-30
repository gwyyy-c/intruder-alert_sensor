import { useState, useEffect, useRef } from 'react';
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
  const lastSeenIdRef = useRef(null);
 
  // Dark Mode Feature
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);
 
 
  const fetchDetections = async (suppressInitial = false) => {
    try {
      const response = await fetch('http://localhost/Actual04/intruder_api.php');
      const data = await response.json();
 
      console.log('Logs:', data);
      // Sort detections so newest is first. Use `time_detected` field from API.
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.time_detected) - new Date(a.time_detected))
        : [];
      setLogs(sorted);
 
      // If there are detections, determine whether to show the alert
      if (sorted.length > 0) {
        const newest = sorted[0];
        setLatestDistance(newest.distance);
 
        if (suppressInitial) {
          // On initial load, don't show alert but record the id
          lastSeenIdRef.current = newest.id;
        } else if (newest.id !== lastSeenIdRef.current) {
          // Only show alert when we detect a different/new id
          setShowAlert(true);
          lastSeenIdRef.current = newest.id;
 
          // Hide alert after 3 seconds
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
 
  useEffect(() => {
    // Initial fetch (suppress alert on first load)
    fetchDetections(true);
 
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchDetections(false);
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
            {latestDistance != null ? `${latestDistance} cm` : '--'}
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
          <button onClick={() => fetchDetections(false)}>Refresh</button>
        </div>
 
        <div className='flex flex-col'>
        <div className='log-top'>
            <h1>ID</h1>
            <h1>Sensor</h1>
            <h1>Distance</h1>
            <h1>Time</h1>
        </div>
          {logs.length === 0 ? (
            <p className='no-data'>No Detections Yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className='log-item'>
                <p>{log.id}</p>
                <p>{log.sensor_type}</p>
                <p>{log.distance} cm</p>
                <p>{log.time_detected}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
 
export default App;