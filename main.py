# main.py
from fastapi import FastAPI, Request
import pandas as pd
import joblib
from datetime import datetime, timedelta
import os

app = FastAPI()

# Load your trained model
model_path = "model_bed_occupancy.pkl"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"{model_path} not found!")

with open(model_path, "rb") as f:
    model = joblib.load(f)


# ADD THIS LINE BELOW TO CHECK TYPE
print("Loaded model type:", type(model))

# Total number of beds in your hospital
TOTAL_BEDS = 100

# Expected columns for model input (must match training data)
MODEL_FEATURE_COLUMNS = [
    "AGE", "GENDER", "TYPE OF ADMISSION-EMERGENCY/OPD", "DURATION OF STAY", "OUTCOME",
    "DM", "HTN", "CAD", "PRIOR CMP", "CKD", "HB", "TLC", "PLATELETS", "GLUCOSE",
    "UREA", "CREATININE", "RAISED CARDIAC ENZYMES", "EF", "SEVERE ANAEMIA", "ANAEMIA",
    "ACS", "STEMI", "HEART FAILURE", "AKI", "DAY_OF_WEEK", "IS_WEEKEND", "MONTH",
    "LAB_RISK_SCORE", "SEASON_Spring", "SEASON_Summer", "SEASON_Winter"
]

# API to predict stay duration for current patients
@app.post("/predict-stay")
async def predict_stay(request: Request):
    try:
        data = await request.json()
        df = pd.DataFrame([data])

        # Check required columns
        for col in MODEL_FEATURE_COLUMNS:
            if col not in df.columns:
                return {"error": f"Missing column: {col}"}

        # Prepare features and make predictions
        features = df[MODEL_FEATURE_COLUMNS]
        predictions = model.predict(features)
        df["Predicted_Stay"] = [round(p) for p in predictions]

        output = df[["Predicted_Stay"]].to_dict(orient="records")
        return {"predictions": output}

    except Exception as e:
        return {"error": str(e)}

# API to calculate available beds today
@app.get("/beds-available")
def beds_available():
    try:
        if not os.path.exists("current_patients.csv"):
            return {"error": "current_patients.csv not found!"}

        df = pd.read_csv("current_patients.csv")

        # Check required columns
        for col in MODEL_FEATURE_COLUMNS:
            if col not in df.columns:
                return {"error": f"Missing column: {col}"}

        features = df[MODEL_FEATURE_COLUMNS]
        predictions = model.predict(features)
        df["Predicted_Stay"] = [round(p) for p in predictions]

        # Set Date_of_Admission to today if missing
        today = pd.to_datetime(datetime.today().strftime('%Y-%m-%d'))

        if "Date_of_Admission" not in df.columns:
            df["Date_of_Admission"] = today
        else:
            df["Date_of_Admission"] = pd.to_datetime(df["Date_of_Admission"], errors='coerce')
            df["Date_of_Admission"].fillna(today, inplace=True)

        # Calculate estimated discharge
        df["Estimated_Discharge"] = df["Date_of_Admission"] + pd.to_timedelta(df["Predicted_Stay"], unit="D")

        # Patients still admitted today
        patients_still_in = df[df["Estimated_Discharge"] > today]

        # Calculate available beds
        available_beds = TOTAL_BEDS - len(patients_still_in)
        available_beds = max(0, available_beds)

        return {"Available_Beds": available_beds}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
