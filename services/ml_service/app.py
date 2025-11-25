# services/ml_service/app.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os
import time

# -----------------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------------
app = FastAPI(title="Carbon Footprint ML Service", version="1.0.0")

start_time = time.time()

# -----------------------------------------------------------------------------
# Load Model + Scaler + Features
# -----------------------------------------------------------------------------
MODEL_PATH = "models/model.sav"
SCALE_PATH = "models/scale.sav"
FEATURE_PATH = "models/feature_names.txt"

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALE_PATH)
    with open(FEATURE_PATH, "r") as f:
        FEATURES = [line.strip() for line in f.readlines()]

    model_loaded = True

except Exception as e:
    model = None
    scaler = None
    FEATURES = []
    model_loaded = False
    print("❌ Failed to load ML model:", e)


# -----------------------------------------------------------------------------
# Request Schema (matches NestJS MLPredictionRequestDto)
# -----------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    body_type: str
    sex: str
    diet: str
    shower_frequency: str
    social_activity: str

    transport: str
    vehicle_type: str
    vehicle_km: float
    air_travel: str

    waste_bag_size: str
    waste_bag_count: float
    recycle_paper: bool
    recycle_plastic: bool
    recycle_glass: bool
    recycle_metal: bool

    heating_energy: str
    cooking_microwave: bool
    cooking_oven: bool
    cooking_grill: bool
    cooking_airfryer: bool
    cooking_stove: bool
    energy_efficiency: str
    daily_tv_pc: float
    internet_daily: float

    grocery_bill: float
    clothes_monthly: float


# -----------------------------------------------------------------------------
# Convert request into model feature vector
# -----------------------------------------------------------------------------
def build_feature_vector(req: PredictionRequest):
    """
    Converts the incoming request into a feature vector based on your feature_names.txt
    """

    vector = []

    # 1. Add direct numeric values
    NUMERICAL_MAP = {
        "Monthly Grocery Bill": req.grocery_bill,
        "Vehicle Monthly Distance Km": req.vehicle_km,
        "Waste Bag Weekly Count": req.waste_bag_count,
        "How Long TV PC Daily Hour": req.daily_tv_pc,
        "How Many New Clothes Monthly": req.clothes_monthly,
        "How Long Internet Daily Hour": req.internet_daily,
    }

    # 2. Add categorical one-hot encodings and booleans
    CATEGORICAL_MAP = {
        "Body Type": req.body_type,
        "Sex": req.sex,
        "How Often Shower": req.shower_frequency,
        "Heating Energy Source": req.heating_energy,
        "Transport": req.transport,
        "Vehicle Type": req.vehicle_type,
        "Social Activity": req.social_activity,
        "Diet": req.diet,
    }

    # 3. Recycling (list)
    recycling_items = []
    if req.recycle_paper:
        recycling_items.append("Paper")
    if req.recycle_plastic:
        recycling_items.append("Plastic")
    if req.recycle_glass:
        recycling_items.append("Glass")
    if req.recycle_metal:
        recycling_items.append("Metal")

    recycling_str = str(recycling_items)

    # 4. Cooking methods list
    cooking_items = []
    if req.cooking_microwave: cooking_items.append("Microwave")
    if req.cooking_oven:      cooking_items.append("Oven")
    if req.cooking_grill:     cooking_items.append("Grill")
    if req.cooking_airfryer:  cooking_items.append("Airfryer")
    if req.cooking_stove:     cooking_items.append("Stove")

    cooking_str = str(cooking_items)

    # -----------------------------------------------------------------------------
    # Build final vector based on feature_names.txt
    # -----------------------------------------------------------------------------
    for feature in FEATURES:

        # 1. Direct numeric features
        if feature in NUMERICAL_MAP:
            vector.append(NUMERICAL_MAP[feature])
            continue

        # 2. Simple categorical features
        for key, value in CATEGORICAL_MAP.items():
            if feature == f"{key}_{value}":
                vector.append(1)
            elif feature.startswith(key + "_"):
                vector.append(0)

        # 3. Recycling
        if feature.startswith("Recycling_"):
            vector.append(1 if feature == f"Recycling_{recycling_str}" else 0)

        # 4. Cooking_With
        if feature.startswith("Cooking_With_"):
            vector.append(1 if feature == f"Cooking_With_{cooking_str}" else 0)

    return np.array(vector).reshape(1, -1)


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model_loaded else "error",
        "model_loaded": model_loaded,
        "version": "1.0.0",
        "uptime_seconds": round(time.time() - start_time, 2),
    }


@app.post("/predict")
def predict(req: PredictionRequest):
    if not model_loaded:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    try:
        vector = build_feature_vector(req)
        vector_scaled = scaler.transform(vector)
        prediction = model.predict(vector_scaled)[0]

        # You can customize sub-footprint breakdown if desired
        return {
            "total_footprint": float(prediction),
            "travel_footprint": float(prediction * 0.30),
            "energy_footprint": float(prediction * 0.25),
            "waste_footprint": float(prediction * 0.15),
            "diet_footprint": float(prediction * 0.30),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------
# Start the server
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
