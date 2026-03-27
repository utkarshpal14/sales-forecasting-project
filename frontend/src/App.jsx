import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sales Forecasting Application</h1>
      </header>
      <main>
        <PredictionForm />
      </main>
    </div>
  );
}

export default App;
