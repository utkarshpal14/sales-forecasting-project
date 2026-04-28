import os
from pathlib import Path
from typing import List

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Minimal input model - only 5 features for simplicity
class PredictionInput(BaseModel):
    Item_MRP: float          # Price - most important
    Item_Type: int           # Product category
    Outlet_Type: int         # Store type
    Outlet_Age: int          # Store age
    Outlet_Location_Type: int  # Location type (0=Rural, 1=Semi-Urban, 2=Urban)

# Input model for best-product endpoint
class BestProductInput(BaseModel):
    Item_MRP: float
    Outlet_Type: int
    Outlet_Age: int
    Outlet_Location_Type: int

# Input model for best-store endpoint  
class BestStoreInput(BaseModel):
    Item_MRP: float
    Item_Type: int
    Outlet_Age: int
    Outlet_Location_Type: int

def engineer_features(data):
    """Create all features from minimal input"""
    df = pd.DataFrame([data])
    
    # Add reasonable defaults for missing features
    default_values = {
        "Item_Weight": 10.0,
        "Item_Fat_Content": 1,
        "Item_Visibility": 0.05,
        "Outlet_Identifier": 1,
        "Outlet_Size": 2,
        "Outlet_Type": 1,  # Default to Supermarket Type 1
    }
    for col, default_val in default_values.items():
        if col not in df.columns:
            df[col] = default_val
    
    # Create engineered features
    df['MRP_Visibility'] = df['Item_MRP'] * df['Item_Visibility']
    df['MRP_Weight'] = df['Item_MRP'] * df['Item_Weight']
    df['Outlet_Age_Type'] = df['Outlet_Age'] * df['Outlet_Type']
    df['Item_Type_Visibility'] = df['Item_Type'] * df['Item_Visibility']
    df['MRP_Squared'] = df['Item_MRP'] ** 2
    df['Weight_Squared'] = df['Item_Weight'] ** 2
    df['MRP_per_Weight'] = df['Item_MRP'] / (df['Item_Weight'] + 1e-6)
    df['Visibility_per_Age'] = df['Item_Visibility'] / (df['Outlet_Age'] + 1e-6)
    
    # Add the missing features
    # Use fixed bins so inference is stable even for single-row inputs.
    df['MRP_Bins'] = pd.cut(
        df['Item_MRP'],
        bins=[0, 100, 200, 300, 400, float("inf")],
        labels=False,
        include_lowest=True
    ).fillna(2)
    df['Outlet_Performance_Score'] = 1500.0  # Default performance score
    df['Price_vs_Category_Avg'] = df['Item_MRP'] / 150.0  # Default category avg
    
    return df.iloc[0].to_dict()

app = FastAPI()

# Enable CORS (for React)
frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
try:
    model_path = Path(__file__).resolve().parent.parent / "models" / "model.pkl"
    data = joblib.load(model_path)
    model = data["model"]
    feature_names = data["features"]
    model_metrics = data.get("metrics", {})
    model_metadata = data.get("metadata", {})
    print(f" Model loaded successfully!")
    print(f" Model expects {len(feature_names)} features: {feature_names}")
except Exception as e:
    print(f" Error loading model: {e}")
    model = None
    feature_names = []
    model_metrics = {}
    model_metadata = {}

@app.get("/")
def home():
    return {"message": "Sales Prediction API is running "}

@app.post("/predict")
def predict(input_data: PredictionInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Engineer features from minimal input
        engineered_data = engineer_features(input_data.model_dump())
        
        # Convert to DataFrame
        df = pd.DataFrame([engineered_data])
        
        # Ensure correct feature order
        df = df[feature_names]
        
        # Make prediction
        prediction = model.predict(df)
        
        return {
            "predicted_sales": float(prediction[0]),
            "status": "success",
            "input_used": input_data.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict-batch")
def predict_batch(input_data: List[PredictionInput]):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Engineer features for all inputs
        engineered_data_list = []
        for item in input_data:
            engineered_data = engineer_features(item.model_dump())
            engineered_data_list.append(engineered_data)
        
        # Convert to DataFrame
        df = pd.DataFrame(engineered_data_list)
        
        # Ensure correct feature order
        df = df[feature_names]
        
        # Make predictions
        predictions = model.predict(df)
        
        return {
            "predictions": predictions.tolist(),
            "count": len(predictions),
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@app.post("/optimal-price")
def optimal_price(input_data: PredictionInput):
    print(f"DEBUG - optimal_price endpoint called with: {input_data}")
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Test different price points
        price_range = range(50, 500, 10)
        max_revenue = 0
        best_price = 0
        results = []
        
        for price in price_range:
            test_data = input_data.model_dump()
            test_data["Item_MRP"] = price
            
            engineered_data = engineer_features(test_data)
            df = pd.DataFrame([engineered_data])
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price optimization error: {str(e)}")

@app.get("/model-info")
def model_info():
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        return {
            "model_type": model_metrics.get("model_name", "Unknown"),
            "r2_score": model_metrics.get("r2"),
            "rmse": model_metrics.get("rmse"),
            "features": feature_names,
            "feature_count": len(feature_names),
            "training_date": model_metadata.get("creation_date"),
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
        
        engineered_data = engineer_features(input_data.model_dump())
        df = pd.DataFrame([engineered_data])
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight error: {str(e)}")

@app.post("/best-product")
def best_product(input_data: BestProductInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Dynamic product range (more scalable)
        product_list = list(range(16))  # Assuming 16 product types
        results = []

        for product in product_list:
            data_copy = input_data.model_dump()
            data_copy["Item_Type"] = product
            
            engineered_data = engineer_features(data_copy)
            df = pd.DataFrame([engineered_data])
            df = df[feature_names]
            
            pred = model.predict(df)[0]
            results.append((product, pred))
            
            # Debug: Print first few products to see pattern
            if product < 3:
                print(f"DEBUG - Product {product}: Input={data_copy}, Prediction={pred}")

        best = max(results, key=lambda x: x[1])
        
        # Debug: Print all results
        print(f"DEBUG - All results: {results}")
        print(f"DEBUG - Best product: {best[0]} with sales: {best[1]}")

        return {
            "best_product": best[0],
            "predicted_sales": float(best[1]),
            "all_results": [{"product": r[0], "predicted_sales": float(r[1])} for r in results],
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Best product error: {str(e)}")

@app.get("/test")
def test_endpoint():
    return {"message": "Server is working", "status": "success"}

@app.post("/best-store")
def best_store(input_data: BestStoreInput):
    print(f"DEBUG - best_store endpoint called with: {input_data}")
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Dynamic store range (more scalable)
        store_list = list(range(10))  # Assuming 10 store types
        results = []

        print(f"DEBUG - Starting best_store with input: {input_data}")
        
        for store in store_list:
            print(f"DEBUG - Testing store {store}")
            data_copy = input_data.model_dump()
            # Add Outlet_Identifier to the data before engineering
            data_copy["Outlet_Identifier"] = store
            
            engineered_data = engineer_features(data_copy)
            df = pd.DataFrame([engineered_data])
            df = df[feature_names]
            
            pred = model.predict(df)[0]
            results.append((store, pred))
            print(f"DEBUG - Store {store} prediction: {pred}")

        best = max(results, key=lambda x: x[1])
        
        # Debug: Print all results
        print(f"DEBUG - Best Store All results: {results}")
        print(f"DEBUG - Best store: {best[0]} with sales: {best[1]}")

        return {
            "best_store": best[0],
            "predicted_sales": float(best[1]),
            "all_results": [{"store": r[0], "predicted_sales": float(r[1])} for r in results],
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in best_store: {str(e)}")
        print(f"ERROR type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Best store error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
