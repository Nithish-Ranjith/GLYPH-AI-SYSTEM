
import os
import random
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import firebase_admin
from firebase_admin import credentials, firestore
from .analysis import UrbanGrowthPredictor

# --- FIREBASE ADMIN SETUP ---
# In production, use a service account JSON file.
# For this simulation/hybrid setup, we initialize implicitly or mock if creds missing.
try:
    if not firebase_admin._apps:
        # TODO: User must provide path to serviceAccountKey.json for write access
        # cred = credentials.Certificate("path/to/serviceAccountKey.json") 
        # firebase_admin.initialize_app(cred)
        firebase_admin.initialize_app() # Tries to use Google Application Default Credentials
    db = firestore.client()
    FIREBASE_AVAILABLE = True
except Exception as e:
    print(f"Warning: Firebase Admin not initialized. Backend cannot push to DB. {e}")
    FIREBASE_AVAILABLE = False

app = FastAPI(title="Tirupati LULC Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = UrbanGrowthPredictor()

# --- DATA PROCESSING PIPELINE ---

def generate_sentinel_grid():
    """
    Simulates the output of the Random Forest Model running on Sentinel-2 data.
    Generates a grid of classified points.
    """
    points = []
    # Tirupati Bounding Box approx
    lat_start, lat_end = 13.58, 13.68
    lng_start, lng_end = 79.35, 79.50
    resolution = 0.0015 # Coarse resolution for demo performance

    # Major Feature Coordinates - GEOGRAPHICALLY CORRECTED
    TIRUPATI_CENTER_LAT, TIRUPATI_CENTER_LNG = 13.6288, 79.4192
    RENIGUNTA_LAT, RENIGUNTA_LNG = 13.6450, 79.4900
    RAYALACHERUVU_LAT, RAYALACHERUVU_LNG = 13.5900, 79.3700
    HILL_BOUNDARY_LAT = 13.6550 

    lat = lat_start
    while lat <= lat_end:
        lng = lng_start
        while lng <= lng_end:
            # Skip some points to simulate sparse raster
            if random.random() > 0.6:
                lng += resolution
                continue

            # Distances
            dCity = ((lat - TIRUPATI_CENTER_LAT)**2 + (lng - TIRUPATI_CENTER_LNG)**2)**0.5
            dRenigunta = ((lat - RENIGUNTA_LAT)**2 + (lng - RENIGUNTA_LNG)**2)**0.5
            dLake = ((lat - RAYALACHERUVU_LAT)**2 + (lng - RAYALACHERUVU_LNG)**2)**0.5
            
            # Classification Logic
            cls18 = "Barren"
            
            # 1. Forest: North of Hills
            if lat > HILL_BOUNDARY_LAT:
                cls18 = "Forest"
            # 2. Water: Lake Only
            elif dLake < 0.012:
                cls18 = "Water"
            # 3. Urban: City Center
            elif dCity < 0.035:
                cls18 = "Built-up"
            # 4. Urban: Renigunta Hub
            elif dRenigunta < 0.02:
                cls18 = "Built-up"
            # 5. Urban Corridor
            elif 13.62 < lat < 13.65 and 79.42 < lng < 79.49 and abs(lat - 13.635) < 0.008:
                if random.random() > 0.3:
                    cls18 = "Built-up"
                else:
                    cls18 = "Agriculture"
            else:
                if random.random() > 0.4:
                    cls18 = "Agriculture"
                else:
                    cls18 = "Barren"

            # Transition Logic (2018 -> 2024)
            cls24 = cls18
            
            # Growth Simulation
            if cls18 == "Agriculture" or cls18 == "Barren":
                # Growth near city
                if 0.035 < dCity < 0.045 and random.random() > 0.6:
                    cls24 = "Built-up"
                # Growth near Renigunta
                if dRenigunta < 0.03 and random.random() > 0.6:
                    cls24 = "Built-up"
            
            # Encroachment
            if cls18 == "Forest" and lat < HILL_BOUNDARY_LAT + 0.005 and random.random() > 0.85:
                cls24 = "Built-up"

            point = {
                "id": f"{lat:.4f}_{lng:.4f}",
                "lat": lat,
                "lng": lng,
                "class2018": cls18,
                "class2024": cls24,
                "confidence": round(random.uniform(0.65, 0.98), 2),
                "variation": round(random.random(), 2),
                "timestamp": firestore.SERVER_TIMESTAMP
            }
            points.append(point)
            lng += resolution
        lat += resolution
    return points

def run_data_pipeline():
    """
    1. Acquisitions (Simulated Sentinel-2 fetch)
    2. Inference (Simulated RF Model)
    3. Storage (Push to Firebase)
    """
    if not FIREBASE_AVAILABLE:
        print("Pipeline Skipped: Firebase not connected.")
        return

    print("🛰️ Starting Sentinel-2 Data Acquisition...")
    time.sleep(1) # Sim processing
    
    print("🧠 Running Random Forest Inference...")
    grid_data = generate_sentinel_grid()
    
    print(f"💾 Persisting {len(grid_data)} geospatial data points to Firestore...")
    
    # Batch write for performance
    batch = db.batch()
    collection_ref = db.collection('lulc_grid')
    
    # Delete old records (for demo cleanliness) - Optional in prod
    # In real app, we'd append time-series
    
    count = 0
    for point in grid_data:
        doc_ref = collection_ref.document(point['id'])
        batch.set(doc_ref, point)
        count += 1
        if count >= 400: # Firestore batch limit is 500
            batch.commit()
            batch = db.batch()
            count = 0
    
    if count > 0:
        batch.commit()
        
    print("✅ Pipeline Complete. Data Synced.")

@app.get("/")
def health_check():
    return {"status": "online", "mode": "Production", "firebase_connected": FIREBASE_AVAILABLE}

@app.post("/api/trigger-pipeline")
def trigger_analysis_pipeline(background_tasks: BackgroundTasks):
    """
    Manually trigger the satellite data processing pipeline.
    This would typically run on a Cron Job.
    """
    background_tasks.add_task(run_data_pipeline)
    return {"message": "Pipeline triggered in background. Check Firestore for updates."}
