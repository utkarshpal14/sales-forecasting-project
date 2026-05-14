import os

from pathlib import Path

from typing import List



import joblib

import numpy as np

import pandas as pd

from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from label_maps import item_type_name, outlet_identifier_name


inference_bundle: dict = {}

model_metadata: dict = {}


def _imap(m: dict, key, default: float) -> float:
    if not m:
        return float(default)
    sk = str(int(key))
    v = m.get(sk)
    return float(v) if v is not None else float(default)


def sales_from_raw_prediction(raw) -> float:
    v = float(raw[0] if isinstance(raw, (list, tuple, np.ndarray)) else raw)
    if model_metadata.get("log_transform", True):
        return float(np.expm1(v))
    return v


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

    """Build the same engineered columns as training (uses `inference` from model.pkl)."""

    inf = inference_bundle or {}

    gm = float(inf.get("global_mean_log_sales") or 7.5)

    te_maps = inf.get("te_maps") or {}

    df = pd.DataFrame([data])

    default_values = {

        "Item_Weight": float(model_metadata.get("avg_weight") or 10.0),

        "Item_Fat_Content": 1,

        "Item_Visibility": float(model_metadata.get("avg_visibility") or 0.05),

        "Outlet_Identifier": 1,

        "Outlet_Size": 2,

        "Outlet_Type": 1,

    }

    for col, default_val in default_values.items():

        if col not in df.columns:

            df[col] = default_val

    it = int(df["Item_Type"].iloc[0])

    oid = int(df["Outlet_Identifier"].iloc[0])

    otype = int(df["Outlet_Type"].iloc[0])

    oloc = int(df["Outlet_Location_Type"].iloc[0])

    osz = int(df["Outlet_Size"].iloc[0])

    mrp_mu = _imap(inf.get("item_type_mrp_mean") or {}, it, 150.0)

    mrp_sd = _imap(inf.get("item_type_mrp_std") or {}, it, 50.0)

    if mrp_sd <= 1e-6:

        mrp_sd = 50.0

    df["MRP_Squared"] = df["Item_MRP"] ** 2

    df["Weight_Squared"] = df["Item_Weight"] ** 2

    df["Outlet_Age_Squared"] = df["Outlet_Age"] ** 2

    df["Item_MRP_zscore"] = (df["Item_MRP"] - mrp_mu) / mrp_sd

    df["MRP_Weight"] = df["Item_MRP"] * df["Item_Weight"]

    df["Outlet_Age_Type"] = df["Outlet_Age"] * df["Outlet_Type"]

    df["Item_Type_Visibility"] = df["Item_Type"] * df["Item_Visibility"]

    df["MRP_Visibility"] = df["Item_MRP"] * df["Item_Visibility"]

    df["MRP_Outlet_Type"] = df["Item_MRP"] * df["Outlet_Type"]

    df["MRP_Outlet_Age"] = df["Item_MRP"] * df["Outlet_Age"]

    df["Outlet_MRP_Avg"] = _imap(inf.get("outlet_mrp_avg") or {}, oid, mrp_mu)

    df["Outlet_Size_Type"] = df["Outlet_Size"] * df["Outlet_Type"]

    df["Outlet_Loc_Type"] = df["Outlet_Location_Type"] * df["Outlet_Type"]

    df["MRP_per_Weight"] = df["Item_MRP"] / (df["Item_Weight"] + 1e-6)

    df["Visibility_per_Age"] = df["Item_Visibility"] / (df["Outlet_Age"] + 1e-6)

    vis_typ = _imap(inf.get("visibility_mean_by_item_type") or {}, it, 0.05)

    wt_typ = _imap(inf.get("weight_mean_by_item_type") or {}, it, 12.0)

    df["Visibility_vs_Type_Avg"] = df["Item_Visibility"] / (vis_typ + 1e-6)

    df["Weight_vs_Type_Avg"] = df["Item_Weight"] / (wt_typ + 1e-6)

    df["MRP_Category_Rank"] = _imap(inf.get("median_mrp_rank_by_item_type") or {}, it, 2.0)

    df["MRP_Bins"] = pd.cut(

        df["Item_MRP"],

        bins=[0, 100, 200, 300, 400, 500],

        labels=False,

        include_lowest=True,

    ).fillna(2).astype(int)

    df["Price_vs_Category_Avg"] = df["Item_MRP"] / (mrp_mu + 1e-6)

    df["Outlet_Type_te"] = _imap(te_maps.get("Outlet_Type") or {}, otype, gm)

    df["Outlet_Identifier_te"] = _imap(te_maps.get("Outlet_Identifier") or {}, oid, gm)

    df["Item_Type_te"] = _imap(te_maps.get("Item_Type") or {}, it, gm)

    df["Outlet_Location_Type_te"] = _imap(te_maps.get("Outlet_Location_Type") or {}, oloc, gm)

    df["Outlet_Size_te"] = _imap(te_maps.get("Outlet_Size") or {}, osz, gm)

    df["Outlet_Performance_Score"] = _imap(

        inf.get("outlet_performance_log_mean") or {}, oid, gm

    )

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

    inference_bundle.clear()

    inference_bundle.update(data.get("inference") or {})

    print(f" Model loaded successfully!")

    print(f" Model expects {len(feature_names)} features: {feature_names}")

except Exception as e:

    print(f" Error loading model: {e}")

    model = None

    feature_names = []

    model_metrics = {}

    model_metadata = {}

    inference_bundle.clear()



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

            "predicted_sales": sales_from_raw_prediction(prediction),

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

        decoded = [sales_from_raw_prediction([p]) for p in predictions]

        return {

            "predictions": decoded,

            "count": len(decoded),

            "status": "success"

        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")



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

            test_data = input_data.model_dump()

            test_data["Item_MRP"] = price

            

            engineered_data = engineer_features(test_data)

            df = pd.DataFrame([engineered_data])

            df = df[feature_names]

            

            sales = sales_from_raw_prediction(model.predict(df))

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

        

        _r2l = model_metrics.get("R2_log", model_metrics.get("r2_log"))

        return {

            "model_type": model_metadata.get("model_name", "Unknown"),

            "r2_score": float(model_metrics.get("R2") or model_metrics.get("r2") or 0),

            "r2_log": None if _r2l is None else float(_r2l),

            "rmse": float(model_metrics.get("RMSE") or model_metrics.get("rmse") or 0),

            "records": 8523,

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

        

        sales = sales_from_raw_prediction(model.predict(df))



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

            

            pred = sales_from_raw_prediction(model.predict(df))

            results.append((product, pred))

        

        best = max(results, key=lambda x: x[1])



        return {

            "best_product": best[0],

            "best_product_name": item_type_name(best[0]),

            "predicted_sales": float(best[1]),

            "all_results": [

                {

                    "product": r[0],

                    "product_name": item_type_name(r[0]),

                    "predicted_sales": float(r[1]),

                }

                for r in results

            ],

            "status": "success",

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

    try:

        if model is None:

            raise HTTPException(status_code=500, detail="Model not loaded")

        

        # Dynamic store range (more scalable)

        store_list = list(range(10))  # Assuming 10 store types

        results = []

        

        for store in store_list:

            data_copy = input_data.model_dump()

            # Add Outlet_Identifier to the data before engineering

            data_copy["Outlet_Identifier"] = store

            

            engineered_data = engineer_features(data_copy)

            df = pd.DataFrame([engineered_data])

            df = df[feature_names]

            

            pred = sales_from_raw_prediction(model.predict(df))

            results.append((store, pred))

        

        best = max(results, key=lambda x: x[1])



        return {

            "best_store": best[0],

            "best_store_name": outlet_identifier_name(best[0]),

            "predicted_sales": float(best[1]),

            "all_results": [

                {

                    "store": r[0],

                    "store_name": outlet_identifier_name(r[0]),

                    "predicted_sales": float(r[1]),

                }

                for r in results

            ],

            "status": "success",

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

