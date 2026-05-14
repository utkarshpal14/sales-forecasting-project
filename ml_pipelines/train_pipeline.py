# ==============================
# SALES FORECASTING ML PIPELINE
# (Leak-safe TE, outlet perf from train only, CatBoost / stack, inference bundle)
# ==============================

import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import (
    HistGradientBoostingRegressor,
    RandomForestRegressor,
    StackingRegressor,
)
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import KFold, train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor

warnings.filterwarnings("ignore", category=FutureWarning)

try:
    from catboost import CatBoostRegressor

    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False


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

    df.drop("Item_Identifier", axis=1, inplace=True)

    df["Item_Fat_Content"] = df["Item_Fat_Content"].replace(
        {"low fat": "Low Fat", "LF": "Low Fat", "reg": "Regular"}
    )

    df["Item_Weight"] = df.groupby("Item_Type")["Item_Weight"].transform(
        lambda x: x.fillna(x.median())
    )

    df["Outlet_Size"] = df.groupby("Outlet_Type")["Outlet_Size"].transform(
        lambda x: x.fillna(x.mode()[0] if not x.mode().empty else "Medium")
    )

    df["Item_Visibility"] = df["Item_Visibility"].replace(
        0, df["Item_Visibility"].mean()
    )

    ref_year = int(df["Outlet_Establishment_Year"].max()) + 1
    df["Outlet_Age"] = ref_year - df["Outlet_Establishment_Year"]
    df.drop("Outlet_Establishment_Year", axis=1, inplace=True)

    for col in ["Item_Weight", "Item_Visibility", "Item_MRP", "Item_Outlet_Sales"]:
        lower = df[col].quantile(0.01)
        upper = df[col].quantile(0.99)
        df[col] = df[col].clip(lower, upper)

    categorical_cols = [
        "Item_Fat_Content",
        "Item_Type",
        "Outlet_Size",
        "Outlet_Location_Type",
        "Outlet_Type",
        "Outlet_Identifier",
    ]
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])

    return df


# ==============================
# 3. FEATURE ENGINEERING (no target leakage before split)
# ==============================


def feature_engineering(df):
    df = df.copy()

    df["MRP_Squared"] = df["Item_MRP"] ** 2
    df["Weight_Squared"] = df["Item_Weight"] ** 2
    df["Outlet_Age_Squared"] = df["Outlet_Age"] ** 2

    grp_mean = df.groupby("Item_Type")["Item_MRP"].transform("mean")
    grp_std = df.groupby("Item_Type")["Item_MRP"].transform("std").replace(0, 1)
    df["Item_MRP_zscore"] = (df["Item_MRP"] - grp_mean) / grp_std

    df["MRP_Weight"] = df["Item_MRP"] * df["Item_Weight"]
    df["Outlet_Age_Type"] = df["Outlet_Age"] * df["Outlet_Type"]
    df["Item_Type_Visibility"] = df["Item_Type"] * df["Item_Visibility"]
    df["MRP_Visibility"] = df["Item_MRP"] * df["Item_Visibility"]
    df["MRP_Outlet_Type"] = df["Item_MRP"] * df["Outlet_Type"]
    df["MRP_Outlet_Age"] = df["Item_MRP"] * df["Outlet_Age"]

    df["Outlet_MRP_Avg"] = df.groupby("Outlet_Identifier")["Item_MRP"].transform(
        "mean"
    )
    df["Outlet_Size_Type"] = df["Outlet_Size"] * df["Outlet_Type"]
    df["Outlet_Loc_Type"] = df["Outlet_Location_Type"] * df["Outlet_Type"]

    df["MRP_per_Weight"] = df["Item_MRP"] / (df["Item_Weight"] + 1e-6)
    df["Visibility_per_Age"] = df["Item_Visibility"] / (df["Outlet_Age"] + 1e-6)
    df["Visibility_vs_Type_Avg"] = df["Item_Visibility"] / df.groupby(
        "Item_Type"
    )["Item_Visibility"].transform("mean")
    df["Weight_vs_Type_Avg"] = df["Item_Weight"] / df.groupby("Item_Type")[
        "Item_Weight"
    ].transform("mean")

    df["MRP_Category_Rank"] = df.groupby("Item_Type")["Item_MRP"].rank()

    df["MRP_Bins"] = (
        pd.cut(
            df["Item_MRP"],
            bins=[0, 100, 200, 300, 400, 500],
            labels=False,
            include_lowest=True,
        )
        .fillna(2)
        .astype(int)
    )

    df["Price_vs_Category_Avg"] = df["Item_MRP"] / df.groupby("Item_Type")[
        "Item_MRP"
    ].transform("mean")

    return df


# ==============================
# 4. TARGET ENCODING (KFold OOF — no leakage)
# ==============================


def target_encode(X_train, y_train, X_test, cols, n_splits=5):
    X_train = X_train.copy().reset_index(drop=True)
    X_test = X_test.copy().reset_index(drop=True)
    y_train = y_train.reset_index(drop=True)

    global_mean = float(y_train.mean())
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)

    for col in cols:
        train_encoded = np.full(len(X_train), global_mean, dtype=float)

        for fold_train_idx, fold_val_idx in kf.split(X_train):
            fold_X_tr = X_train.iloc[fold_train_idx]
            fold_y_tr = y_train.iloc[fold_train_idx]
            temp = pd.DataFrame({"cat": fold_X_tr[col].values, "target": fold_y_tr.values})
            cat_means = temp.groupby("cat")["target"].mean()

            fold_X_val = X_train.iloc[fold_val_idx]
            encoded = fold_X_val[col].map(cat_means).fillna(global_mean)
            train_encoded[fold_val_idx] = encoded.values

        X_train[f"{col}_te"] = train_encoded

        temp_full = pd.DataFrame({"cat": X_train[col].values, "target": y_train.values})
        full_means = temp_full.groupby("cat")["target"].mean()
        X_test[f"{col}_te"] = X_test[col].map(full_means).fillna(global_mean)

    return X_train, X_test


def add_outlet_performance_train_only(X_train, y_train, X_test):
    """Mean log-sales per outlet on TRAIN only — maps to train & test (no test-label leak)."""
    gm = float(y_train.mean())
    perf = (
        pd.DataFrame({"o": X_train["Outlet_Identifier"].values, "y": y_train.values})
        .groupby("o")["y"]
        .mean()
    )
    X_train = X_train.copy()
    X_test = X_test.copy()
    X_train["Outlet_Performance_Score"] = (
        X_train["Outlet_Identifier"].map(perf).fillna(gm).astype(np.float64)
    )
    X_test["Outlet_Performance_Score"] = (
        X_test["Outlet_Identifier"].map(perf).fillna(gm).astype(np.float64)
    )
    return X_train, X_test


# ==============================
# 5. MODEL FACTORIES
# ==============================


def build_models():
    models = {}

    models["Random Forest"] = RandomForestRegressor(
        n_estimators=600,
        max_depth=18,
        min_samples_leaf=3,
        min_samples_split=6,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1,
    )

    models["XGBoost"] = XGBRegressor(
        n_estimators=2200,
        max_depth=7,
        learning_rate=0.035,
        subsample=0.85,
        colsample_bytree=0.85,
        colsample_bylevel=0.85,
        min_child_weight=4,
        reg_alpha=0.15,
        reg_lambda=1.2,
        gamma=0.05,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )

    models["XGBoost Tuned"] = XGBRegressor(
        n_estimators=2800,
        max_depth=6,
        learning_rate=0.025,
        subsample=0.82,
        colsample_bytree=0.82,
        colsample_bylevel=0.82,
        min_child_weight=5,
        reg_alpha=0.25,
        reg_lambda=1.8,
        gamma=0.1,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )

    models["HistGBM"] = HistGradientBoostingRegressor(
        max_iter=900,
        max_depth=12,
        learning_rate=0.06,
        min_samples_leaf=15,
        l2_regularization=0.05,
        random_state=42,
    )

    if HAS_CATBOOST:
        models["CatBoost"] = CatBoostRegressor(
            iterations=4000,
            learning_rate=0.04,
            depth=8,
            l2_leaf_reg=4.0,
            loss_function="RMSE",
            random_seed=42,
            verbose=False,
            allow_writing_files=False,
            early_stopping_rounds=120,
        )

    est_stack = [
        (
            "xgb_s",
            XGBRegressor(
                n_estimators=1600,
                max_depth=6,
                learning_rate=0.04,
                subsample=0.85,
                colsample_bytree=0.85,
                min_child_weight=4,
                reg_alpha=0.2,
                reg_lambda=1.5,
                random_state=43,
                n_jobs=-1,
                verbosity=0,
            ),
        ),
        (
            "hgb_s",
            HistGradientBoostingRegressor(
                max_iter=700,
                max_depth=11,
                learning_rate=0.07,
                min_samples_leaf=12,
                l2_regularization=0.08,
                random_state=43,
            ),
        ),
    ]

    models["Stacking (XGB+HGB+Ridge)"] = StackingRegressor(
        estimators=est_stack,
        final_estimator=RidgeCV(alphas=np.logspace(-3, 3, 25)),
        cv=KFold(n_splits=5, shuffle=True, random_state=42),
        passthrough=False,
        n_jobs=1,
    )

    return models


def fresh_model(best_name):
    """New estimator instance for final full-data fit (avoid refitting shared CV objects)."""
    return build_models()[best_name]


# ==============================
# 6. EVALUATION
# ==============================


def _inverse_y(pred_log, y_log):
    return np.expm1(pred_log), np.expm1(y_log)


def evaluate_all_models(models, X_train, y_train, X_test, y_test):
    results = {}
    print("\n" + "=" * 72)
    print(
        f"{'Model':<32} {'Train RMSE':>12} {'Test RMSE':>12} "
        f"{'R2(orig)':>10} {'R2(log)':>10}"
    )
    print("=" * 72)

    for name, model in models.items():
        if name == "CatBoost" and HAS_CATBOOST:
            X_tr, X_val, y_tr, y_val = train_test_split(
                X_train, y_train, test_size=0.12, random_state=42
            )
            model.fit(X_tr, y_tr, eval_set=(X_val, y_val), use_best_model=True)
        else:
            model.fit(X_train, y_train)

        pred_test = model.predict(X_test)
        pt, yt = _inverse_y(pred_test, y_test.values)
        test_rmse = float(np.sqrt(mean_squared_error(yt, pt)))
        r2_orig = float(r2_score(yt, pt))
        r2_log = float(r2_score(y_test.values, pred_test))

        pred_train = model.predict(X_train)
        ptr, ytr = _inverse_y(pred_train, y_train.values)
        train_rmse = float(np.sqrt(mean_squared_error(ytr, ptr)))

        results[name] = {
            "RMSE": test_rmse,
            "R2": r2_orig,
            "R2_log": r2_log,
            "Train_RMSE": train_rmse,
        }

        gap = ""
        if train_rmse < test_rmse * 0.78:
            gap = " [overfit?]"

        print(
            f"{name:<32} {train_rmse:>12.2f} {test_rmse:>12.2f} "
            f"{r2_orig:>10.4f} {r2_log:>10.4f}{gap}"
        )

    print("=" * 72)
    return results


def select_best_model(results):
    best_name = max(results, key=lambda x: (results[x]["R2_log"], results[x]["R2"]))
    return best_name, results[best_name]


# ==============================
# 7. INFERENCE STATS (full training frame, log target)
# ==============================


def _series_to_json_map(s):
    return {str(int(k)) if isinstance(k, (np.integer, int)) else str(k): float(v) for k, v in s.items()}


def build_inference_bundle(df_pre, df_fe, y_log):
    """Statistics from full labeled data for API feature alignment."""
    gm = float(y_log.mean())

    te_cols = [
        "Outlet_Type",
        "Outlet_Identifier",
        "Item_Type",
        "Outlet_Location_Type",
        "Outlet_Size",
    ]
    te_maps = {}
    for col in te_cols:
        m = pd.DataFrame({"c": df_fe[col].values, "y": y_log.values}).groupby("c")[
            "y"
        ].mean()
        te_maps[col] = _series_to_json_map(m)

    mrp_mean_it = df_fe.groupby("Item_Type")["Item_MRP"].mean()
    mrp_std_it = df_fe.groupby("Item_Type")["Item_MRP"].std().replace(0, 1.0)

    vis_mean_it = df_fe.groupby("Item_Type")["Item_Visibility"].mean()
    wt_mean_it = df_fe.groupby("Item_Type")["Item_Weight"].mean()

    outlet_mrp = df_fe.groupby("Outlet_Identifier")["Item_MRP"].mean()
    outlet_cnt = df_fe.groupby("Outlet_Identifier")["Outlet_Identifier"].count()
    outlet_perf = pd.DataFrame({"o": df_fe["Outlet_Identifier"].values, "y": y_log.values}).groupby("o")["y"].mean()

    rank_med_it = df_fe.groupby("Item_Type")["MRP_Category_Rank"].median()

    bundle = {
        "log_transform": True,
        "global_mean_log_sales": gm,
        "te_maps": te_maps,
        "item_type_mrp_mean": _series_to_json_map(mrp_mean_it),
        "item_type_mrp_std": _series_to_json_map(mrp_std_it),
        "visibility_mean_by_item_type": _series_to_json_map(vis_mean_it),
        "weight_mean_by_item_type": _series_to_json_map(wt_mean_it),
        "outlet_mrp_avg": _series_to_json_map(outlet_mrp),
        "outlet_item_count": _series_to_json_map(outlet_cnt),
        "outlet_performance_log_mean": _series_to_json_map(outlet_perf),
        "median_mrp_rank_by_item_type": _series_to_json_map(rank_med_it),
        "avg_weight": float(df_pre["Item_Weight"].mean()),
        "avg_visibility": float(df_pre["Item_Visibility"].mean()),
    }
    return bundle


def apply_inference_te(X, te_maps, global_mean):
    X = X.copy()
    for col, mmap in te_maps.items():
        keys = X[col].astype(int).astype(str)
        X[f"{col}_te"] = keys.map(mmap).astype(float).fillna(global_mean)
    return X


def add_outlet_performance_full(X, outlet_perf_map, global_mean):
    X = X.copy()
    keys = X["Outlet_Identifier"].astype(int).astype(str)
    X["Outlet_Performance_Score"] = keys.map(outlet_perf_map).astype(float).fillna(
        global_mean
    )
    return X


# ==============================
# 8. SAVE
# ==============================


def save_model(model, feature_list, results, best_model_name, inference_bundle):
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, "models")
    os.makedirs(out_dir, exist_ok=True)

    metadata = {
        "model_name": best_model_name,
        "creation_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "log_transform": True,
        "high_threshold": 1500,
        "medium_threshold": 800,
        "avg_weight": inference_bundle["avg_weight"],
        "avg_visibility": inference_bundle["avg_visibility"],
    }

    model_data = {
        "model": model,
        "features": feature_list,
        "metrics": results[best_model_name],
        "metadata": metadata,
        "inference": inference_bundle,
    }

    out_path = os.path.join(out_dir, "model.pkl")
    joblib.dump(model_data, out_path)

    m = results[best_model_name]
    print(f"\n{'=' * 72}")
    print(f"SAVED:          {out_path}")
    print(f"WINNER:         {best_model_name}")
    print(f"Test RMSE:      {m['RMSE']:.2f}")
    print(f"Train RMSE:     {m['Train_RMSE']:.2f}")
    print(f"R2 (original):  {m['R2']:.4f}")
    print(f"R2 (log space): {m.get('R2_log', float('nan')):.4f}")
    print(f"Features:       {len(feature_list)}")
    print(f"CatBoost used:  {HAS_CATBOOST}")
    print(f"{'=' * 72}")


# ==============================
# 9. MAIN
# ==============================


def run_pipeline(data_path):
    df = load_data(data_path)
    df_raw = preprocess_data(df)
    df_fe = feature_engineering(df_raw)

    y = np.log1p(df_raw["Item_Outlet_Sales"].values)
    X = df_fe.drop(columns=["Item_Outlet_Sales"], errors="ignore").copy()
    X = X.reset_index(drop=True)

    idx = np.arange(len(X))
    tr_idx, te_idx = train_test_split(idx, test_size=0.2, random_state=42)
    X_train = X.iloc[tr_idx].reset_index(drop=True)
    X_test = X.iloc[te_idx].reset_index(drop=True)
    y_train = pd.Series(y[tr_idx]).reset_index(drop=True)
    y_test = pd.Series(y[te_idx]).reset_index(drop=True)

    te_cols = [
        "Outlet_Type",
        "Outlet_Identifier",
        "Item_Type",
        "Outlet_Location_Type",
        "Outlet_Size",
    ]

    print("\nApplying KFold target encoding...")
    X_train, X_test = target_encode(X_train, y_train, X_test, cols=te_cols, n_splits=5)
    X_train, X_test = add_outlet_performance_train_only(X_train, y_train, X_test)

    assert "Outlet_Performance_Score" in X_train.columns
    assert len(X_train.columns) == 36, f"expected 36 features, got {len(X_train.columns)}"

    print(f"Train {X_train.shape} | Test {X_test.shape} | features={len(X_train.columns)}")

    models = build_models()
    results = evaluate_all_models(models, X_train, y_train, X_test, y_test)
    best_name, _ = select_best_model(results)
    print(f"\nBest model: {best_name} (highest R2 on log target, tie-break R2 on rupees)")

    # --- Refit winner on ALL rows with full-data TE + outlet perf for deployment ---
    y_full = pd.Series(y)
    X_full = X.copy()
    inf = build_inference_bundle(df_raw, df_fe, y_full)

    X_full_fit = apply_inference_te(X_full, inf["te_maps"], inf["global_mean_log_sales"])
    X_full_fit = add_outlet_performance_full(
        X_full_fit,
        inf["outlet_performance_log_mean"],
        inf["global_mean_log_sales"],
    )

    best_model = fresh_model(best_name)
    if best_name == "CatBoost" and HAS_CATBOOST:
        X_tr, X_val, y_tr, y_val = train_test_split(
            X_full_fit, y_full, test_size=0.1, random_state=42
        )
        best_model.fit(X_tr, y_tr, eval_set=(X_val, y_val), use_best_model=True)
    else:
        best_model.fit(X_full_fit, y_full)

    X_test_fit = X.iloc[te_idx].reset_index(drop=True)
    X_test_fit = apply_inference_te(X_test_fit, inf["te_maps"], inf["global_mean_log_sales"])
    X_test_fit = add_outlet_performance_full(
        X_test_fit,
        inf["outlet_performance_log_mean"],
        inf["global_mean_log_sales"],
    )

    pred_test = best_model.predict(X_test_fit)
    pt, yt = _inverse_y(pred_test, y_test.values)
    final_rmse = float(np.sqrt(mean_squared_error(yt, pt)))
    final_r2 = float(r2_score(yt, pt))
    final_r2_log = float(r2_score(y_test.values, pred_test))
    results[best_name] = {
        "RMSE": final_rmse,
        "R2": final_r2,
        "R2_log": final_r2_log,
        "Train_RMSE": float(
            np.sqrt(
                mean_squared_error(
                    np.expm1(y_full),
                    np.expm1(best_model.predict(X_full_fit)),
                )
            )
        ),
    }

    print(
        f"\nFinal holdout (refit on full train, scored on same 20% rows): "
        f"RMSE={final_rmse:.2f}  R2(orig)={final_r2:.4f}  R2(log)={final_r2_log:.4f}"
    )

    save_model(best_model, X_full_fit.columns.tolist(), results, best_name, inf)

    # Optional JSON copy of inference for debugging
    inf_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "models",
        "inference_bundle.json",
    )
    with open(inf_path, "w", encoding="utf-8") as f:
        json.dump(inf, f, indent=2)
    print(f"Wrote {inf_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(here, "..", "dataset", "train.csv")
    run_pipeline(csv_path)
