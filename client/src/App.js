import React, { useEffect, useState } from 'react';
import './App.css';
import { Login } from './components/Login';
import { Register } from './components/Register';

function App() {
  // const [backendData, setBackendData] = useState({});

  // useEffect(() => {
  //   fetch('/message')
  //     .then((res) => res.json())
  //     .then((data) => setBackendData(data));
  // }, []);

  const [currentForm, setCurrentForm] = useState('login');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <div className='App'>
      {/* <h1>{!backendData.message ? 'Loading...' : backendData.message}</h1> */}

      {currentForm === 'login' ? (
        <Login onFormSwitch={toggleForm} />
      ) : (
        <Register onFormSwitch={toggleForm} />
      )}
    </div>
  );
}

export default App;
