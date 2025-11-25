# services/ml_service/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os
import time

app = FastAPI(title="Carbon Footprint ML Service", version="1.0.0")
start_time = time.time()

MODEL_PATH = "models/model.sav"
SCALE_PATH = "models/scale.sav"
FEATURE_PATH = "models/feature_names.txt"

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALE_PATH)
    with open(FEATURE_PATH, "r") as f:
        FEATURES = [line.strip() for line in f.readlines() if line.strip()]
    model_loaded = True
except Exception as e:
    model = None
    scaler = None
    FEATURES = []
    model_loaded = False
    print("❌ Failed to load ML model:", e)


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


def build_feature_vector(req: PredictionRequest):
    """
    Build a feature vector that has exactly one value for every feature
    listed in FEATURES (models/feature_names.txt).
    """
    # safe conversions
    grocery = float(req.grocery_bill or 0)
    vehicle_km = float(req.vehicle_km or 0)
    waste_count = float(req.waste_bag_count or 0)
    tv_hours = float(req.daily_tv_pc or 0)
    clothes = float(req.clothes_monthly or 0)
    internet_hours = float(req.internet_daily or 0)

    # create recycling and cooking list strings as in training
    recycling_items = []
    if req.recycle_paper:
        recycling_items.append("Paper")
    if req.recycle_plastic:
        recycling_items.append("Plastic")
    if req.recycle_glass:
        recycling_items.append("Glass")
    if req.recycle_metal:
        recycling_items.append("Metal")
    recycling_str = str(recycling_items)  # e.g. "['Paper','Plastic']"

    cooking_items = []
    if req.cooking_microwave:
        cooking_items.append("Microwave")
    if req.cooking_oven:
        cooking_items.append("Oven")
    if req.cooking_grill:
        cooking_items.append("Grill")
    if req.cooking_airfryer:
        cooking_items.append("Airfryer")
    if req.cooking_stove:
        cooking_items.append("Stove")
    cooking_str = str(cooking_items)

    # prepare helpers for categorical checks
    def one_hot_match(feature_prefix: str, feature: str, expected_value: str):
        """Return 1 if feature equals prefix_expectedValue else 0 when feature startswith prefix_"""
        if not feature.startswith(feature_prefix + "_"):
            return None  # not related
        expected_feature = f"{feature_prefix}_{expected_value}"
        return 1 if feature == expected_feature else 0

    vector = []
    for feature in FEATURES:
        # numeric features (exact string matches from your feature_names.txt)
        if feature == "Monthly Grocery Bill":
            vector.append(grocery)
            continue
        if feature == "Vehicle Monthly Distance Km":
            vector.append(vehicle_km)
            continue
        if feature == "Waste Bag Weekly Count":
            vector.append(waste_count)
            continue
        if feature == "How Long TV PC Daily Hour":
            vector.append(tv_hours)
            continue
        if feature == "How Many New Clothes Monthly":
            vector.append(clothes)
            continue
        if feature == "How Long Internet Daily Hour":
            vector.append(internet_hours)
            continue

        # categorical one-hot (Diet_, Transport_, Vehicle Type_, Heating Energy Source_, Body Type, Sex, How Often Shower, Social Activity)
        matched = False

        # Diet
        val = one_hot_match("Diet", feature, req.diet)
        if val is not None:
            vector.append(val)
            continue

        # Transport
        val = one_hot_match("Transport", feature, req.transport)
        if val is not None:
            vector.append(val)
            continue

        # Vehicle Type
        val = one_hot_match("Vehicle Type", feature, req.vehicle_type)
        if val is not None:
            vector.append(val)
            continue

        # Heating Energy Source
        # note: feature names use e.g. "Heating Energy Source_coal"
        val = one_hot_match("Heating Energy Source", feature, req.heating_energy)
        if val is not None:
            vector.append(val)
            continue

        # Body Type (if one-hot created that way)
        val = one_hot_match("Body Type", feature, req.body_type)
        if val is not None:
            vector.append(val)
            continue

        # Sex
        val = one_hot_match("Sex", feature, req.sex)
        if val is not None:
            vector.append(val)
            continue

        # How Often Shower
        val = one_hot_match("How Often Shower", feature, req.shower_frequency)
        if val is not None:
            vector.append(val)
            continue

        # Social Activity
        val = one_hot_match("Social Activity", feature, req.social_activity)
        if val is not None:
            vector.append(val)
            continue

        # Energy efficiency (some datasets keep it as direct categorical or as one-hot)
        val = one_hot_match("Energy efficiency", feature, req.energy_efficiency)
        if val is not None:
            vector.append(val)
            continue

        # Frequency of traveling by air
        val = one_hot_match("Frequency of Traveling by Air", feature, req.air_travel)
        if val is not None:
            vector.append(val)
            continue

        # Recycling features (the training file used entire list-string as category)
        if feature.startswith("Recycling_"):
            vector.append(1 if feature == f"Recycling_{recycling_str}" else 0)
            continue

        # Cooking_With_ features (training used full list-string as category)
        if feature.startswith("Cooking_With_"):
            vector.append(1 if feature == f"Cooking_With_{cooking_str}" else 0)
            continue

        # Fallback: if feature exactly matches 'Energy efficiency' (not one-hot), map to a simple numeric encoding
        if feature == "Energy efficiency":
            # map common values to a numeric representation (adjust if you used a different mapping during training)
            map_eff = {"never": 0, "sometimes": 1, "always": 2}
            valnum = map_eff.get(req.energy_efficiency.lower(), 1) if isinstance(req.energy_efficiency, str) else 1
            vector.append(valnum)
            continue

        # If none of the above rules matched, append 0 (safe default) to keep vector length stable
        vector.append(0)

    # final sanity check
    vec = np.array(vector).reshape(1, -1)
    if vec.shape[1] != len(FEATURES):
        raise ValueError(f"Feature vector length {vec.shape[1]} != FEATURES length {len(FEATURES)}")

    return vec


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

        return {
            "total_footprint": float(prediction),
            "travel_footprint": float(prediction * 0.30),
            "energy_footprint": float(prediction * 0.25),
            "waste_footprint": float(prediction * 0.15),
            "diet_footprint": float(prediction * 0.30),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
