import React, { useEffect, useState } from 'react';

function App() {
  const [backendData, setBackendData] = useState({});

  useEffect(() => {
    fetch('/message')
      .then((res) => res.json())
      .then((data) => setBackendData(data));
  }, []);

  return (
    <div>
      <h1>{!backendData.message ? 'Loading...' : backendData.message}</h1>
    </div>
  );
}

export default App;
