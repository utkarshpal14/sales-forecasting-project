# ==============================
# SALES FORECASTING ML PIPELINE
# ==============================

import os
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# ==============================
# 1. LOAD DATA
# ==============================

def load_data(path):
    df = pd.read_csv(path)
    print(f"Loaded dataset: {df.shape}")
    return df


# ==============================
# 2. CLEANING & PREPROCESSING
# ==============================

def preprocess_data(df):
    df = df.copy()

    # Drop ID
    df.drop('Item_Identifier', axis=1, inplace=True)

    # Fix categorical inconsistency
    df['Item_Fat_Content'] = df['Item_Fat_Content'].replace({
        'low fat': 'Low Fat',
        'LF': 'Low Fat',
        'reg': 'Regular'
    })

    # Fill missing values
    df['Item_Weight'] = df.groupby('Item_Type')['Item_Weight'].transform(
        lambda x: x.fillna(x.median())
    )

    df['Outlet_Size'] = df.groupby('Outlet_Type')['Outlet_Size'].transform(
        lambda x: x.fillna(x.mode()[0] if not x.mode().empty else 'Medium')
    )

    # Fix visibility
    df['Item_Visibility'] = df['Item_Visibility'].replace(
        0, df['Item_Visibility'].mean()
    )

    # Create Outlet Age
    df['Outlet_Age'] = 2025 - df['Outlet_Establishment_Year']
    df.drop('Outlet_Establishment_Year', axis=1, inplace=True)

    # Handle outliers
    for col in ['Item_Weight', 'Item_Visibility', 'Item_MRP', 'Item_Outlet_Sales']:
        lower = df[col].quantile(0.01)
        upper = df[col].quantile(0.99)
        df[col] = df[col].clip(lower, upper)

    # Encode categorical
    le = LabelEncoder()
    cat_cols = [
        'Item_Fat_Content', 'Item_Type', 'Outlet_Identifier',
        'Outlet_Size', 'Outlet_Location_Type', 'Outlet_Type'
    ]

    for col in cat_cols:
        df[col] = le.fit_transform(df[col])

    return df


# ==============================
# 3. FEATURE ENGINEERING
# ==============================

def feature_engineering(df):
    df = df.copy()

    # Interaction
    df['MRP_Visibility'] = df['Item_MRP'] * df['Item_Visibility']
    df['MRP_Weight'] = df['Item_MRP'] * df['Item_Weight']
    df['Outlet_Age_Type'] = df['Outlet_Age'] * df['Outlet_Type']
    df['Item_Type_Visibility'] = df['Item_Type'] * df['Item_Visibility']

    # Polynomial
    df['MRP_Squared'] = df['Item_MRP'] ** 2
    df['Weight_Squared'] = df['Item_Weight'] ** 2

    # Ratios
    df['MRP_per_Weight'] = df['Item_MRP'] / (df['Item_Weight'] + 1e-6)
    df['Visibility_per_Age'] = df['Item_Visibility'] / (df['Outlet_Age'] + 1e-6)

    # Extra features
    df['MRP_Bins'] = pd.cut(df['Item_MRP'], bins=5, labels=False)
    df['Outlet_Performance_Score'] = df.groupby('Outlet_Identifier')['Item_Outlet_Sales'].transform('mean')
    df['Price_vs_Category_Avg'] = df['Item_MRP'] / df.groupby('Item_Type')['Item_MRP'].transform('mean')

    return df


# ==============================
# 4. SPLIT DATA
# ==============================

def split_data(df):
    X = df.drop('Item_Outlet_Sales', axis=1)
    y = df['Item_Outlet_Sales']

    return train_test_split(X, y, test_size=0.2, random_state=42)


# ==============================
# 5. TRAIN MODELS
# ==============================

def train_models(X_train, y_train):
    models = {}

    models['Linear Regression'] = LinearRegression()
    models['Decision Tree'] = DecisionTreeRegressor(random_state=42)
    models['Random Forest'] = RandomForestRegressor(n_estimators=100, random_state=42)

    # Optional XGBoost
    try:
        from xgboost import XGBRegressor
        models['XGBoost'] = XGBRegressor(
            n_estimators=400, max_depth=5, learning_rate=0.03,
            subsample=0.8, colsample_bytree=0.8, random_state=42
        )
    except:
        pass

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)

    return models


# ==============================
# 6. EVALUATE MODELS
# ==============================

def evaluate_models(models, X_test, y_test):
    results = {}

    for name, model in models.items():
        pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, pred))
        r2 = r2_score(y_test, pred)

        results[name] = {"RMSE": rmse, "R2": r2}

    return results


# ==============================
# 7. SELECT BEST MODEL
# ==============================

def select_best_model(results):
    best = sorted(results.items(), key=lambda x: x[1]["RMSE"])[0]
    return best


# ==============================
# 8. CROSS VALIDATION
# ==============================

def cross_validate(model, X, y):
    scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')
    return np.sqrt(-scores)


# ==============================
# 9. SAVE MODEL
# ==============================

def save_model(model, X, results, best_model_name):
    os.makedirs("../models", exist_ok=True)

    model_data = {
        "model": model,
        "features": X.columns.tolist(),
        "metrics": results[best_model_name],
        "metadata": {
            "model_name": best_model_name,
            "creation_date": pd.Timestamp.now().strftime('%Y-%m-%d')
        }
    }

    joblib.dump(model_data, "../models/model.pkl")
    print("Model saved successfully!")


# ==============================
# MAIN PIPELINE
# ==============================

def run_pipeline(data_path):
    df = load_data(data_path)

    df = preprocess_data(df)
    df = feature_engineering(df)

    X_train, X_test, y_train, y_test = split_data(df)

    models = train_models(X_train, y_train)

    results = evaluate_models(models, X_test, y_test)

    best_model_name, best_metrics = select_best_model(results)
    best_model = models[best_model_name]

    print("\nBest Model:", best_model_name)
    print("Metrics:", best_metrics)

    cv_scores = cross_validate(best_model, df.drop('Item_Outlet_Sales', axis=1), df['Item_Outlet_Sales'])
    print("CV RMSE:", cv_scores.mean())

    save_model(best_model, df.drop('Item_Outlet_Sales', axis=1), results, best_model_name)


# ==============================
# RUN
# ==============================

if __name__ == "__main__":
    run_pipeline("../dataset/train.csv")