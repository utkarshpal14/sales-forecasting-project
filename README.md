# Smart Sales Forecasting & Inventory Prediction Platform

An AI-powered full-stack web application that predicts retail product sales using Machine Learning and provides business insights for inventory optimization.

 Live Demo: https://sales-forecasting-project-hun2.vercel.app/

 Backend API: https://sales-forecast-api-6hky.onrender.com/

 Tech Stack: 
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![CatBoost](https://img.shields.io/badge/CatBoost-ML-yellow)
![License](https://img.shields.io/badge/License-Educational-green)

 Built as a Project Based Learning (PBL-I) project at Chitkara University.

##  Application Preview

### Dashboard

<img width="1919" height="903" alt="Screenshot 2026-05-24 100228" src="https://github.com/user-attachments/assets/c116129a-af9f-4ce7-86fc-511ba1dae9bb" />

### Prediction
<img width="1903" height="891" alt="Screenshot 2026-05-23 145755" src="https://github.com/user-attachments/assets/4c96d970-8788-4f4e-bfd3-b73c1b11deb2" />

### Business Insights
<img width="1893" height="891" alt="Screenshot 2026-05-23 145816" src="https://github.com/user-attachments/assets/d37cde5c-dea9-47bd-a293-3f88d50eefde" />

##  Features

-  Sales Prediction
-  Batch CSV Prediction
-  Optimal Price Suggestion
-  Business Insights
-  Demand Classification
-  Best Product Recommendation
-  Best Store Recommendation
-  Secure Authentication
-  Cloud Deployment
  
### Machine learning
- Preprocessing, feature engineering, and **KFold target encoding** (no test-set leakage)
- **Outlet performance** scores computed from training data only
- Model comparison: Random Forest, HistGradientBoosting, XGBoost, optional **CatBoost**, and a **stacking** ensemble
- Log-transformed target with metrics on both log and original (rupee) scale
- Serialized `model.pkl` plus an **inference bundle** for consistent feature engineering at API time

### Web application
| Page | Description |
|------|-------------|
| **Dashboard** | Overview stats, charts, and quick actions |
| **Predict** | Single-item and batch CSV predictions |
| **Optimize** | Optimal price, best product, and best store recommendations |
| **Insights** | Sales insight analysis from product/store inputs |
| **Model info** | Metrics, feature list, and API endpoint reference |

### API (`backend/main.py`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Single sales prediction |
| `POST` | `/predict-batch` | Batch predictions |
| `POST` | `/insight` | Insight for a scenario |
| `POST` | `/optimal-price` | Price optimization |
| `POST` | `/best-product` | Best product for a store context |
| `POST` | `/best-store` | Best store for a product context |
| `GET` | `/model-info` | Model metadata and evaluation metrics |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **ML** | Python, pandas, scikit-learn, XGBoost, CatBoost (optional), joblib |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | React 18, React Router, Tailwind CSS, Recharts, Framer Motion, Three.js |
| **Auth** | Supabase (email signup/login) |
| **Deploy** | Vercel (frontend), Render (backend) — see [Deployment](#deployment) |

## Project structure

```
sales-forecasting-project/
├── dataset/                 # train.csv, test.csv, sample_submission.csv
├── notebooks/
│   └── model_training.ipynb # Exploratory training notebook
├── ml_pipelines/
│   └── train_pipeline.py    # Production training script (recommended)
├── models/
│   ├── model.pkl            # Trained model + metadata + inference bundle
│   └── inference_bundle.json
├── backend/
│   ├── main.py              # FastAPI app and feature engineering
│   ├── label_maps.py        # Human-readable labels for API responses
│   ├── utils.py
│   └── requirements.txt
├── frontend/                # React dashboard (see frontend/README.md)
├── reports/
│   └── project_report.docx
└── README.md
```

## Prerequisites

- **Python** 3.10+ (3.11 recommended)
- **Node.js** 18+ and npm
- **Supabase** project (for auth in the frontend)

## Local development

### 1. Train or refresh the model (optional)

From the repository root, with dependencies installed (`pip install -r backend/requirements.txt`):

```bash
python ml_pipelines/train_pipeline.py
```

This reads `dataset/train.csv`, evaluates candidate models, refits the winner on all data, and writes `models/model.pkl` and `models/inference_bundle.json`.

You can also experiment in `notebooks/model_training.ipynb`.

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API loads `models/model.pkl` on startup. Confirm it is running: [http://localhost:8000](http://localhost:8000).

### 3. Frontend

```bash
cd frontend
npm install
```

Copy environment variables (see [Environment variables](#environment-variables)):

```bash
copy .env.example .env
```

Set your Supabase URL and anon key in `.env`. Development API URL is already in `.env.development` (`http://localhost:8000`).

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The dev server proxies API calls to port 8000.

## Environment variables

### Frontend

| File | When used | Purpose |
|------|-----------|---------|
| `.env` | Local secrets (gitignored) | `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` |
| `.env.development` | `npm start` | `REACT_APP_API_BASE_URL=http://localhost:8000` |
| `.env.production` | Vercel build | Your Render (or other) backend URL |

See `frontend/.env.example` for a template.

### Backend (production)

Set **`FRONTEND_ORIGINS`** on Render to your Vercel URL (comma-separated for multiple origins), e.g. `https://your-app.vercel.app`.

### Supabase signup rate limits

Supabase’s built-in email on the free tier limits confirmation emails (~2–4/hour). For local testing, disable **Confirm email** under Authentication → Providers → Email, or configure custom SMTP for production.

## Deployment

### Backend (Render)

1. Create a **Web Service** pointing at the `backend` directory (or repo root with start command in `backend`).
2. Install: `pip install -r requirements.txt`
3. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Ensure `models/model.pkl` is present in the deployed artifact (committed or built in CI).
5. Set `FRONTEND_ORIGINS` to your frontend origin(s).

### Frontend (Vercel)

1. Import the repo; set **Root Directory** to `frontend`.
2. Build: `npm run build` · Output: `build`.
3. Add Supabase env vars and set production `REACT_APP_API_BASE_URL` to your Render URL (in Vercel env vars or `.env.production`).

More frontend-specific notes: [frontend/README.md](frontend/README.md).

## Dataset

Retail outlet sales data under `dataset/` (Big Mart–style features: item attributes, outlet type, location, MRP, visibility, etc.). Training uses `train.csv`; `test.csv` and `sample_submission.csv` are available for evaluation workflows.

## 📄 License

This project was developed for academic and portfolio purposes. Feel free to explore the code for learning and educational use.
