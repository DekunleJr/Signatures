import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || '/';
    fetch(`${url}/api`)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend</h1>
        <p>Message from backend: {message}</p>
      </header>
    </div>
  );
}

export default App
