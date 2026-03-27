import React, { useState } from 'react';
import { predictSales } from '../api/api';

function PredictionForm() {
  const [formData, setFormData] = useState({
    // TODO: Add form fields based on your model features
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await predictSales(formData);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-form">
      <h2>Sales Prediction</h2>
      <form onSubmit={handleSubmit}>
        {/* TODO: Add form input fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Sales'}
        </button>
      </form>
      {prediction && (
        <div className="prediction-result">
          <h3>Prediction Result:</h3>
          <p>{prediction.prediction}</p>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;
