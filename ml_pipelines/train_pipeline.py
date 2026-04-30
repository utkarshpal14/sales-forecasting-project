# ==============================
# SALES FORECASTING ML PIPELINE
# ==============================

import os
import numpy as np
import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, KFold
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor


# ==============================
# 1. LOAD DATA
# ==============================

def load_data(path):
    df = pd.read_csv(path)
    print(f"Loaded dataset: {df.shape}")
    return df


# ==============================
# 2. PREPROCESSING
# ==============================

def preprocess_data(df):
    df = df.copy()

    df.drop('Item_Identifier', axis=1, inplace=True)

    df['Item_Fat_Content'] = df['Item_Fat_Content'].replace({
        'low fat': 'Low Fat',
        'LF':      'Low Fat',
        'reg':     'Regular'
    })

    df['Item_Weight'] = df.groupby('Item_Type')['Item_Weight'].transform(
        lambda x: x.fillna(x.median())
    )

    df['Outlet_Size'] = df.groupby('Outlet_Type')['Outlet_Size'].transform(
        lambda x: x.fillna(
            x.mode()[0] if not x.mode().empty else 'Medium'
        )
    )

    df['Item_Visibility'] = df['Item_Visibility'].replace(
        0, df['Item_Visibility'].mean()
    )

    df['Outlet_Age'] = 2025 - df['Outlet_Establishment_Year']
    df.drop('Outlet_Establishment_Year', axis=1, inplace=True)

    for col in ['Item_Weight', 'Item_Visibility',
                'Item_MRP', 'Item_Outlet_Sales']:
        lower = df[col].quantile(0.01)
        upper = df[col].quantile(0.99)
        df[col] = df[col].clip(lower, upper)

    categorical_cols = [
        'Item_Fat_Content',
        'Item_Type',
        'Outlet_Size',
        'Outlet_Location_Type',
        'Outlet_Type',
        'Outlet_Identifier'
    ]
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])

    return df


# ==============================
# 3. FEATURE ENGINEERING
# ==============================

def feature_engineering(df):
    df = df.copy()

    # Polynomial features
    df['MRP_Squared'] = df['Item_MRP'] ** 2
    df['Weight_Squared'] = df['Item_Weight'] ** 2
    df['Outlet_Age_Squared'] = df['Outlet_Age'] ** 2
    
    # Z-score features
    grp_mean = df.groupby('Item_Type')['Item_MRP'].transform('mean')
    grp_std  = df.groupby('Item_Type')['Item_MRP'].transform('std').replace(0, 1)
    df['Item_MRP_zscore'] = (df['Item_MRP'] - grp_mean) / grp_std
    
    # Interaction features
    df['MRP_Weight'] = df['Item_MRP'] * df['Item_Weight']
    df['Outlet_Age_Type'] = df['Outlet_Age'] * df['Outlet_Type']
    df['Item_Type_Visibility'] = df['Item_Type'] * df['Item_Visibility']
    df['MRP_Visibility'] = df['Item_MRP'] * df['Item_Visibility']
    df['MRP_Outlet_Type'] = df['Item_MRP'] * df['Outlet_Type']
    df['MRP_Outlet_Age'] = df['Item_MRP'] * df['Outlet_Age']
    
    # Outlet aggregated features
    df['Outlet_MRP_Avg'] = df.groupby('Outlet_Identifier')['Item_MRP'].transform('mean')
    df['Outlet_Size_Type'] = df['Outlet_Size'] * df['Outlet_Type']
    df['Outlet_Loc_Type'] = df['Outlet_Location_Type'] * df['Outlet_Type']
    
    # Ratio features
    df['MRP_per_Weight'] = df['Item_MRP'] / (df['Item_Weight'] + 1e-6)
    df['Visibility_per_Age'] = df['Item_Visibility'] / (df['Outlet_Age'] + 1e-6)
    df['Visibility_vs_Type_Avg'] = df['Item_Visibility'] / df.groupby('Item_Type')['Item_Visibility'].transform('mean')
    df['Weight_vs_Type_Avg'] = df['Item_Weight'] / df.groupby('Item_Type')['Item_Weight'].transform('mean')
    
    # Ranking features
    df['MRP_Category_Rank'] = df.groupby('Item_Type')['Item_MRP'].rank()
    
    # Binning
    df['MRP_Bins'] = pd.cut(df['Item_MRP'], bins=[0, 100, 200, 300, 400, 500], labels=False).fillna(2).astype(int)
    
    # Performance features
    df['Outlet_Performance_Score'] = df.groupby('Outlet_Identifier')['Item_Outlet_Sales'].transform('mean')
    df['Price_vs_Category_Avg'] = df['Item_MRP'] / df.groupby('Item_Type')['Item_MRP'].transform('mean')
    
    # Target encoded features (te = target encoding)
    df['Outlet_Type_te'] = df.groupby('Outlet_Type')['Item_Outlet_Sales'].transform('mean')
    df['Outlet_Identifier_te'] = df.groupby('Outlet_Identifier')['Item_Outlet_Sales'].transform('mean')
    df['Item_Type_te'] = df.groupby('Item_Type')['Item_Outlet_Sales'].transform('mean')
    df['Outlet_Location_Type_te'] = df.groupby('Outlet_Location_Type')['Item_Outlet_Sales'].transform('mean')
    df['Outlet_Size_te'] = df.groupby('Outlet_Size')['Item_Outlet_Sales'].transform('mean')
    
    return df


# ==============================
# 4. TARGET ENCODING (Fixed)
# ==============================

def target_encode(X_train, y_train, X_test, cols, n_splits=5):
    """
    KFold out-of-fold target encoding.
    Zero leakage — train encoded using OOF only.
    Test encoded using full train means.
    """
    X_train = X_train.copy().reset_index(drop=True)
    X_test  = X_test.copy().reset_index(drop=True)
    y_train = y_train.reset_index(drop=True)

    global_mean = y_train.mean()
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)

    for col in cols:
        train_encoded = np.full(len(X_train), global_mean, dtype=float)

        for fold_train_idx, fold_val_idx in kf.split(X_train):
            # Get fold train data
            fold_X_tr = X_train.iloc[fold_train_idx]
            fold_y_tr = y_train.iloc[fold_train_idx]

            # Compute mean target per category on fold train
            temp = pd.DataFrame({
                'cat':    fold_X_tr[col].values,
                'target': fold_y_tr.values
            })
            cat_means = temp.groupby('cat')['target'].mean()

            # Map to validation fold
            fold_X_val = X_train.iloc[fold_val_idx]
            encoded    = fold_X_val[col].map(cat_means).fillna(global_mean)
            train_encoded[fold_val_idx] = encoded.values

        X_train[f'{col}_te'] = train_encoded

        # Full train mean for test set
        temp_full  = pd.DataFrame({
            'cat':    X_train[col].values,
            'target': y_train.values
        })
        full_means = temp_full.groupby('cat')['target'].mean()
        X_test[f'{col}_te'] = X_test[col].map(full_means).fillna(global_mean)

    return X_train, X_test


# ==============================
# 5. TRAIN ALL MODELS
# ==============================

def train_all_models(X_train, y_train):
    models = {
        'Random Forest': RandomForestRegressor(
            n_estimators=500,
            max_depth=15,
            min_samples_leaf=5,
            min_samples_split=10,
            max_features=0.7,
            random_state=42,
            n_jobs=-1
        ),
        'XGBoost': XGBRegressor(
            n_estimators=800,
            max_depth=5,
            learning_rate=0.03,
            subsample=0.75,
            colsample_bytree=0.75,
            colsample_bylevel=0.75,
            min_child_weight=8,
            reg_alpha=0.3,
            reg_lambda=1.5,
            gamma=0.1,
            random_state=42,
            verbosity=0
        ),
        'XGBoost Tuned': XGBRegressor(
            n_estimators=1000,
            max_depth=4,
            learning_rate=0.02,
            subsample=0.8,
            colsample_bytree=0.8,
            colsample_bylevel=0.8,
            min_child_weight=10,
            reg_alpha=0.5,
            reg_lambda=2.0,
            gamma=0.2,
            random_state=42,
            verbosity=0
        )
    }

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        print(f"  {name} done.")

    return models


# ==============================
# 6. EVALUATE ALL MODELS
# ==============================

def evaluate_all_models(models, X_train, y_train, X_test, y_test):
    results = {}

    print("\n" + "=" * 68)
    print(f"{'Model':<22} {'Train RMSE':>12} {'Test RMSE':>12} {'R2':>10}")
    print("=" * 68)

    for name, model in models.items():
        pred_test  = np.expm1(model.predict(X_test))
        y_true     = np.expm1(y_test)
        test_rmse  = np.sqrt(mean_squared_error(y_true, pred_test))
        r2         = r2_score(y_true, pred_test)

        pred_train = np.expm1(model.predict(X_train))
        y_tr_true  = np.expm1(y_train)
        train_rmse = np.sqrt(mean_squared_error(y_tr_true, pred_train))

        results[name] = {
            "RMSE":       test_rmse,
            "R2":         r2,
            "Train_RMSE": train_rmse
        }

        gap_flag = " ⚠ overfit" if train_rmse < test_rmse * 0.80 else ""
        print(
            f"{name:<22} {train_rmse:>12.2f} "
            f"{test_rmse:>12.2f} {r2:>10.4f}{gap_flag}"
        )

    print("=" * 68)
    return results


# ==============================
# 7. FEATURE IMPORTANCES
# ==============================

def print_feature_importances(model, feature_names, top_n=15):
    importances = model.feature_importances_
    paired = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True
    )

    print(f"\nTop {top_n} Feature Importances (XGBoost Tuned):")
    print("-" * 52)
    print(f"{'Feature':<32} {'Importance':>10}")
    print("-" * 52)
    for feat, imp in paired[:top_n]:
        bar = "█" * int(imp * 50)
        print(f"{feat:<32} {imp:>8.4f}  {bar}")
    print("-" * 52)


# ==============================
# 8. SELECT BEST MODEL
# ==============================

def select_best_model(results):
    best_name = min(results, key=lambda x: results[x]["RMSE"])
    return best_name, results[best_name]


# ==============================
# 9. SAVE MODEL
# ==============================

def save_model(model, X, results, best_model_name):
    os.makedirs("../models", exist_ok=True)

    metadata = {
        "model_name":       best_model_name,
        "creation_date":    pd.Timestamp.now().strftime('%Y-%m-%d'),
        "log_transform":    True,
        "high_threshold":   1500,
        "medium_threshold": 800
    }

    if 'Item_Weight' in X.columns:
        metadata["avg_weight"] = float(X['Item_Weight'].mean())
    if 'Item_Visibility' in X.columns:
        metadata["avg_visibility"] = float(X['Item_Visibility'].mean())

    model_data = {
        "model":    model,
        "features": X.columns.tolist(),
        "metrics":  results[best_model_name],
        "metadata": metadata
    }

    joblib.dump(model_data, "../models/model.pkl")

    print(f"\n{'='*68}")
    print(f"WINNER:         {best_model_name}")
    print(f"Test RMSE:      {results[best_model_name]['RMSE']:.2f}")
    print(f"Train RMSE:     {results[best_model_name]['Train_RMSE']:.2f}")
    print(f"R2 Score:       {results[best_model_name]['R2']:.4f}")
    print(f"Features saved: {len(X.columns)}")
    print(f"{'='*68}")


# ==============================
# 10. MAIN PIPELINE
# ==============================

def run_pipeline(data_path):

    # Step 1 — Load
    df = load_data(data_path)

    # Step 2 — Preprocess
    df = preprocess_data(df)

    # Step 3 — Feature engineering
    df = feature_engineering(df)

    # Step 4 — Log transform target
    df['Item_Outlet_Sales'] = np.log1p(df['Item_Outlet_Sales'])

    # Step 5 — Split BEFORE target encoding
    X = df.drop('Item_Outlet_Sales', axis=1)
    y = df['Item_Outlet_Sales']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Step 6 — Target encode (after split, zero leakage)
    target_encode_cols = [
        'Outlet_Type',
        'Outlet_Identifier',
        'Item_Type',
        'Outlet_Location_Type',
        'Outlet_Size'
    ]

    print("\nApplying KFold target encoding...")
    X_train, X_test = target_encode(
        X_train, y_train, X_test,
        cols=target_encode_cols,
        n_splits=5
    )
    print(f"  Done. Features: {X_train.shape[1]}")

    print(f"\nTraining set: {X_train.shape}")
    print(f"Test set:     {X_test.shape}")
    print(f"\nFeatures ({len(X_train.columns)}):")
    for i, col in enumerate(X_train.columns, 1):
        print(f"  {i:>2}. {col}")

    # Step 7 — Train
    models = train_all_models(X_train, y_train)

    # Step 8 — Evaluate
    results = evaluate_all_models(
        models, X_train, y_train, X_test, y_test
    )

    # Step 9 — Feature importances
    print_feature_importances(
        models['XGBoost Tuned'],
        X_train.columns.tolist()
    )

    # Step 10 — Select best
    best_name, _ = select_best_model(results)

    # Step 11 — Save
    save_model(models[best_name], X_train, results, best_name)


# ==============================
# RUN
# ==============================

if __name__ == "__main__":
    run_pipeline("../dataset/train.csv")