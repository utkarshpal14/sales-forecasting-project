from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from typing import List

# Pydantic model for input validation
class PredictionInput(BaseModel):
    Item_MRP: float
    Item_Type: int
    Outlet_Type: int
    Item_Fat_Content: int
    Item_Visibility: float
    Outlet_Age: int
    Outlet_Identifier: int

app = FastAPI()

# Enable CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
try:
    data = joblib.load("../models/model.pkl")
    model = data["model"]
    feature_names = data["features"]
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    feature_names = []

@app.get("/")
def home():
    return {"message": "Sales Prediction API is running 🚀"}

@app.post("/predict")
def predict(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data.dict()])
        
        # Ensure correct feature order
        df = df[feature_names]

        prediction = model.predict(df)

        return {
            "predicted_sales": float(prediction[0]),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/predict-batch")
def predict_batch(input_data: List[PredictionInput]):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Convert to DataFrame
        df = pd.DataFrame([item.dict() for item in input_data])
        
        # Ensure correct feature order
        df = df[feature_names]

        predictions = model.predict(df)

        return {
            "predictions": predictions.tolist(),
            "count": len(predictions),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch prediction error: {str(e)}")

@app.post("/optimal-price")
def optimal_price(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Test different price points
        price_range = range(50, 500, 10)
        max_revenue = 0
        best_price = 0
        results = []
        
        for price in price_range:
            test_data = input_data.dict()
            test_data["Item_MRP"] = price
            
            df = pd.DataFrame([test_data])
            df = df[feature_names]
            
            sales = model.predict(df)[0]
            revenue = sales * price
            
            results.append({
                "price": price,
                "predicted_sales": float(sales),
                "predicted_revenue": float(revenue)
            })
            
            if revenue > max_revenue:
                max_revenue = revenue
                best_price = price
        
        return {
            "optimal_price": best_price,
            "expected_revenue": float(max_revenue),
            "analysis": results,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Price optimization error: {str(e)}")

@app.get("/model-info")
def model_info():
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        return {
            "model_type": "Random Forest",
            "r2_score": 0.5897,
            "rmse": 1035.43,
            "features": feature_names,
            "feature_count": len(feature_names),
            "training_date": "2024-03-29",
            "version": "1.0",
            "status": "active",
            "endpoints": [
                "/predict - Single prediction",
                "/predict-batch - Multiple predictions",
                "/insight - Sales insights and recommendations",
                "/best-product - Find best product type",
                "/best-store - Find best store location",
                "/optimal-price - Find optimal price point",
                "/model-info - Model information"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model info error: {str(e)}")

@app.post("/insight")
def insight(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        df = pd.DataFrame([input_data.dict()])
        df = df[feature_names]

        sales = model.predict(df)[0]

        # Demand logic
        if sales > 1500:
            demand = "High"
            recommendation = "Stock more"
        elif sales > 800:
            demand = "Medium"
            recommendation = "Maintain stock"
        else:
            demand = "Low"
            recommendation = "Reduce stock"

        return {
            "predicted_sales": float(sales),
            "demand_level": demand,
            "recommendation": recommendation,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Insight error: {str(e)}")

@app.post("/best-product")
def best_product(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Dynamic product range (more scalable)
        product_list = list(range(16))  # Assuming 16 product types
        results = []

        for product in product_list:
            data_copy = input_data.dict()
            data_copy["Item_Type"] = product

            df = pd.DataFrame([data_copy])
            df = df[feature_names]

            pred = model.predict(df)[0]
            results.append((product, pred))

        best = max(results, key=lambda x: x[1])

        return {
            "best_product": best[0],
            "predicted_sales": float(best[1]),
            "all_results": [{"product": r[0], "predicted_sales": float(r[1])} for r in results],
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Best product error: {str(e)}")

@app.post("/best-store")
def best_store(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Dynamic store range (more scalable)
        store_list = list(range(10))  # Assuming 10 store types
        results = []

        for store in store_list:
            data_copy = input_data.dict()
            data_copy["Outlet_Identifier"] = store

            df = pd.DataFrame([data_copy])
            df = df[feature_names]

            pred = model.predict(df)[0]
            results.append((store, pred))

        best = max(results, key=lambda x: x[1])

        return {
            "best_store": best[0],
            "predicted_sales": float(best[1]),
            "all_results": [{"store": r[0], "predicted_sales": float(r[1])} for r in results],
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Best store error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
