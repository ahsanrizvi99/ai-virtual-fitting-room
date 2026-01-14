# ==============================================================================
#      VirtualFIT Backend (Revised to act as a Proxy to Colab)
# ==============================================================================
import os
import shutil
import httpx # You need to install this: pip install httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Imports for skin tone matching are kept, as that is a separate feature
import cv2
import numpy as np
import math
import base64
import json
from pydantic import BaseModel

# ==============================================================================
#                             INITIALIZATION
# ==============================================================================
app = FastAPI(title="VirtualFIT Backend")

# --- IMPORTANT: UPDATE THIS URL ---
# Paste the public URL from your running Colab notebook here.
# Make sure it ends with the correct endpoint: /run-inference/
COLAB_BACKEND_URL = "https://5c0a23c3c1b3.ngrok-free.app/run-inference/"

# CORS Configuration to allow your React frontend (usually on port 3000) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path Configuration (only needed for skin-tone matching now)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_JSON_PATH = os.path.join(BASE_DIR, "..", "frontend", "public", "models.json")

# Skin-tone matching utilities
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# ==============================================================================
#                                 DATA MODELS
# ==============================================================================
class SkinMatchRequest(BaseModel):
    image_base64: str

# ==============================================================================
#                        SKIN TONE ANALYSIS (UNCHANGED)
# ==============================================================================
def analyze_skin_tone(image_bgr):
    """Analyze skin tone from face in image"""
    try:
        lab_img = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)
        l_channel, _, b_channel = cv2.split(lab_img)
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
        if not len(faces): return None, "No face detected"
        x, y, w, h = max(faces, key=lambda f: f[2]*f[3])
        face_l = l_channel[y:y+h, x:x+w]
        face_b = b_channel[y:y+h, x:x+w]
        skin_mask = (face_l > 20) & (face_l < 240)
        l_skin = face_l[skin_mask]
        b_skin = face_b[skin_mask]
        if l_skin.size < 100: return None, "Not enough skin pixels"
        avg_l = np.mean(l_skin)
        avg_b = np.mean(b_skin) or 0.01
        ita_angle = math.degrees(math.atan((avg_l - 50) / avg_b))
        return ita_angle, "Success"
    except Exception as e:
        return None, str(e)

# ==============================================================================
#                                API ENDPOINTS
# ==============================================================================
@app.post("/match-skin-tone/")
async def match_skin_tone(request: SkinMatchRequest):
    """Match user's skin tone with available models"""
    try:
        # Decode base64 image from the frontend request
        image_data = base64.b64decode(request.image_base64.split(',')[1])
        img_bgr = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        
        # Analyze skin tone using the OpenCV function
        ita_value, status = analyze_skin_tone(img_bgr)
        if ita_value is None:
            raise HTTPException(status_code=400, detail=status)
        
        # Find the best matching model from your models.json file
        with open(MODELS_JSON_PATH) as f:
            models = json.load(f)
        
        # Find the model with the closest ITA value to the user's
        best_match = min(models, key=lambda m: abs(m.get('ita_value', 0) - ita_value))
        
        # Return the result to the frontend
        return {
            "best_match_tone": best_match['skin_tone'],
            "ita_value": ita_value
        }
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"The models.json file was not found at {MODELS_JSON_PATH}. Please check the path.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/virtual-try-on/")
async def virtual_try_on(
    person_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...)
):
    """
    This endpoint now acts as a proxy. It receives files from the frontend,
    forwards them to the Colab backend, and streams the result back.
    """
    # Prepare the files to be sent to the Colab backend
    files = {
        'person_image': (person_image.filename, await person_image.read(), person_image.content_type),
        'cloth_image': (cloth_image.filename, await cloth_image.read(), cloth_image.content_type)
    }

    # Use an async HTTP client to make the request to Colab
    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            print(f"Forwarding request to Colab: {COLAB_BACKEND_URL}")
            response = await client.post(COLAB_BACKEND_URL, files=files)
            
            # Check if the request to Colab was successful
            if response.status_code != 200:
                error_detail = response.text
                print(f"Error from Colab: {response.status_code} - {error_detail}")
                raise HTTPException(status_code=response.status_code, detail=f"Error from Colab backend: {error_detail}")

            # Stream the image response from Colab directly back to the frontend
            return StreamingResponse(response.iter_bytes(), media_type=response.headers['content-type'])

        except httpx.RequestError as e:
            print(f"Error connecting to Colab: {e}")
            raise HTTPException(status_code=502, detail=f"Could not connect to the Colab backend: {e}")

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "colab_url": COLAB_BACKEND_URL}

# ==============================================================================
#                                 MAIN EXECUTION
# ==============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")