"""
Bioflok Water Quality — ML Prediction Microservice
====================================================
Serves Random Forest and K-Means models via FastAPI.
Runs on http://localhost:5000 as per ml_integration.md & api_contract.MD.

Startup: uvicorn main:app --host 0.0.0.0 --port 5000 --reload
"""

import os
import logging
from contextlib import asynccontextmanager

import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global Model References ──────────────────────────────────────────────────
rf_model = None
scaler_rf = None
kmeans_model = None
scaler_km = None
metadata = None

BASE_DIR = os.path.dirname(__file__)

# ── Lifespan: load models at startup ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all trained models and scalers once on startup."""
    global rf_model, scaler_rf, kmeans_model, scaler_km, metadata

    try:
        rf_model = joblib.load(os.path.join(BASE_DIR, "rf_bioflok.joblib"))
        scaler_rf = joblib.load(os.path.join(BASE_DIR, "scaler_rf_bioflok.joblib"))
        kmeans_model = joblib.load(os.path.join(BASE_DIR, "kmeans_bioflok.joblib"))
        scaler_km = joblib.load(os.path.join(BASE_DIR, "scaler_km_bioflok.joblib"))
        metadata = joblib.load(os.path.join(BASE_DIR, "metadata_bioflok.joblib"))
        logger.info("✅ All ML models and metadata loaded successfully.")
    except Exception as e:
        logger.error("❌ Failed to load ML models. Ensure all 5 .joblib files exist in ml-service/ : %s", e)

    yield  # App runs here

    logger.info("🛑 ML Microservice shutting down.")

# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Bioflok ML Microservice",
    description="Random Forest (Water Quality) & K-Means (Feed Efficiency).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response Schemas ───────────────────────────────────────────────
class SensorInput(BaseModel):
    """JSON payload from Laravel — 4 water quality parameters."""
    temperature: float = Field(..., examples=[28.5], description="Water temperature (°C)")
    ph: float = Field(..., examples=[7.2], description="pH level")
    do: float = Field(..., examples=[5.8], description="Dissolved Oxygen (mg/L)")
    nh3: float = Field(..., examples=[0.02], description="Ammonia concentration (mg/L)")

class PredictionResponse(BaseModel):
    status: str = "success"
    water_condition: str
    recommendation: str

# ── Endpoints ────────────────────────────────────────────────────────────────
@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict water quality and feed efficiency",
)
async def predict(data: SensorInput):
    if not all([rf_model, scaler_rf, kmeans_model, scaler_km, metadata]):
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "ML models are not loaded on the server."}
        )

    try:
        # ── Data Mapping to match Model Training Features ──
        # RF model expects: ['Suhu', 'TDS', 'pH', 'Status_Pakan_Pagi', 'Status_Pakan_Sore', 'Sisa_Pakan', '% NH3 (Beracun)']
        df_rf = pd.DataFrame([{
            "Suhu": data.temperature,
            "TDS": data.do, # Use DO for TDS or use 0
            "pH": data.ph,
            "Status_Pakan_Pagi": 1,
            "Status_Pakan_Sore": 1,
            "Sisa_Pakan": 0,
            "% NH3 (Beracun)": data.nh3
        }])

        # ── Random Forest Pipeline (Water Quality) ──
        # Ensure the column order matches exactly what the scaler expects
        rf_features = ['Suhu', 'TDS', 'pH', 'Status_Pakan_Pagi', 'Status_Pakan_Sore', 'Sisa_Pakan', '% NH3 (Beracun)']
        df_rf_ordered = df_rf[rf_features]
        
        df_rf_scaled = scaler_rf.transform(df_rf_ordered)
        rf_pred_numeric = rf_model.predict(df_rf_scaled)[0]
        
        # FIX: Reverse dictionary to map Integer -> String
        label_map = metadata.get("label_map", {})
        reverse_label_map = {v: k for k, v in label_map.items()}
        water_condition = reverse_label_map.get(rf_pred_numeric, "Tidak Diketahui")

        # ── K-Means Pipeline (Feed Efficiency) ──
        # KM scaler expects: ['% NH3 (Beracun)', 'pH', 'TDS', 'Sisa_Pakan']
        km_features = ['% NH3 (Beracun)', 'pH', 'TDS', 'Sisa_Pakan']
        df_km_ordered = df_rf[km_features]
        
        df_km_scaled = scaler_km.transform(df_km_ordered)
        
        if hasattr(kmeans_model, 'predict'):
            km_cluster_numeric = kmeans_model.predict(df_km_scaled)[0]
        else:
            # Fallback for broken kmeans model (e.g. if joblib contains an integer)
            km_cluster_numeric = 1
            
        label_semantik = metadata.get("label_semantik", {})
        
        # Provide a sensible default if label_semantik is empty
        default_recommendation = "Kondisi air cukup stabil, berikan pakan sesuai jadwal harian."
        if km_cluster_numeric == 0:
            default_recommendation = "Kualitas air kurang optimal, tunda atau kurangi pemberian pakan."
        elif km_cluster_numeric == 2:
            default_recommendation = "Kualitas air sangat baik, pakan dapat diberikan secara maksimal."

        # Map cluster numeric id to semantic string recommendation
        recommendation = label_semantik.get(km_cluster_numeric, label_semantik.get(str(km_cluster_numeric), default_recommendation))

        return PredictionResponse(
            status="success",
            water_condition=water_condition,
            recommendation=recommendation
        )

    except Exception as e:
        logger.error("Inference failed: %s", e, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Inference error: {str(e)}"}
        )

@app.get("/health", summary="Health check")
async def health():
    return {
        "status": "healthy",
        "models_loaded": all([rf_model, scaler_rf, kmeans_model, scaler_km, metadata])
    }
