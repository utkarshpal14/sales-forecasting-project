# Sales Forecasting Project

A machine learning application for sales forecasting with a modern web interface.

## Project Structure

```
sales-forecasting-project/
├── dataset/                      # 📊 Raw dataset storage
├── notebooks/                    # 📓 ML development (Jupyter)
│   └── model_training.ipynb
├── models/                       # 🤖 Saved models
│   └── model.pkl
├── backend/                      # ⚙️ FastAPI backend
│   ├── main.py
│   ├── model.pkl
│   ├── requirements.txt
│   └── utils.py
├── frontend/                     # 🎨 React app
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   └── PredictionForm.jsx
│   │   └── api/
│   │       └── api.js
│   └── package.json
├── reports/                      # 📄 Project report
│   └── project_report.docx
├── README.md
└── requirements.txt
```

## Getting Started

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run the API server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Features
- Machine learning model for sales prediction
- RESTful API for model inference
- Modern React-based user interface
- Real-time predictions

## TODO
- Add dataset and implement model training
- Complete API endpoints
- Finalize frontend components
- Add model evaluation metrics
