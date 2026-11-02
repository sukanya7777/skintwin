
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from recommendation_engine import generate_skincare_plan

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

YOUCAM_API_KEY = os.getenv("YOUCAM_API_KEY")
YOUCAM_BASE_URL = "https://yce-api-01.makeupar.com"

app = FastAPI(
    title="SkinTwin API",
    description="Backend for SkinTwin - Your Skin's Digital Twin",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SKIN_ACTIONS = [
    "hd_acne",
    "hd_pore",
    "hd_texture",
    "hd_moisture",
    "hd_redness",
    "hd_oiliness",
    "hd_radiance",
    "hd_age_spot",
    "hd_wrinkle",
    "hd_skin_type",
]

MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png"}


def get_auth_headers():
    if not YOUCAM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YouCam API key is not configured in backend/.env",
        )

    return {
        "Authorization": f"Bearer {YOUCAM_API_KEY}",
        "Content-Type": "application/json",
    }


@app.get("/")
async def root():
    return {
        "message": "Welcome to SkinTwin API",
        "status": "running",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "youcam_key_configured": bool(YOUCAM_API_KEY),
    }


@app.post("/api/skin/scan")
async def create_skin_scan(file: UploadFile = File(...)):
    """
    1. Validate uploaded selfie.
    2. Request a YouCam upload URL.
    3. Upload image bytes to that URL.
    4. Create a Skin Analysis v2.1 task.
    5. Return task_id for frontend polling.
    """

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG or PNG image.",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 10 MB.",
        )

    headers = get_auth_headers()

    filename = Path(file.filename or "skin-selfie.jpg").name

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:

            # STEP 1: Request a pre-signed upload URL from YouCam.
            file_response = await client.post(
                f"{YOUCAM_BASE_URL}/s2s/v2.1/file/skin-analysis",
                headers=headers,
                json={
                    "files": [
                        {
                            "content_type": file.content_type,
                            "file_name": filename,
                            "file_size": len(image_bytes),
                        }
                    ]
                },
            )

            file_response.raise_for_status()
            file_data = file_response.json()

            uploaded_file = file_data["data"]["files"][0]
            file_id = uploaded_file["file_id"]
            upload_request = uploaded_file["requests"][0]

            # STEP 2: Upload the actual image bytes to the signed URL.
            upload_headers = upload_request.get("headers", {})

            upload_response = await client.put(
                upload_request["url"],
                content=image_bytes,
                headers=upload_headers,
            )

            upload_response.raise_for_status()

            # STEP 3: Create the Skin Analysis v2.1 task.
            task_response = await client.post(
                f"{YOUCAM_BASE_URL}/s2s/v2.1/task/skin-analysis",
                headers=headers,
                json={
                    "src_file_id": file_id,
                    "dst_actions": SKIN_ACTIONS,
                    "format": "json",
                },
            )

            task_response.raise_for_status()
            task_data = task_response.json()

            task_id = task_data["data"]["task_id"]

            return {
                "success": True,
                "message": "Skin analysis task created.",
                "task_id": task_id,
                "file_id": file_id,
                "task_status": "running",
            }

    except httpx.HTTPStatusError as exc:
        try:
            error_details = exc.response.json()
        except Exception:
            error_details = exc.response.text

        raise HTTPException(
            status_code=502,
            detail={
                "message": "YouCam API returned an error.",
                "upstream_status": exc.response.status_code,
                "upstream_error": error_details,
            },
        )

    except (httpx.RequestError, KeyError, IndexError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not complete YouCam upload or task creation: {str(exc)}",
        )

    finally:
        await file.close()


@app.get("/api/skin/scan/{task_id}")
async def get_skin_scan(task_id: str):
    """Retrieve the current status and results of a YouCam analysis task."""

    headers = get_auth_headers()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{YOUCAM_BASE_URL}/s2s/v2.1/task/skin-analysis/{task_id}",
                headers=headers,
            )

            response.raise_for_status()
            result = response.json()

            return {
                "success": True,
                "task_id": task_id,
                "data": result.get("data", {}),
            }

    except httpx.HTTPStatusError as exc:
        try:
            error_details = exc.response.json()
        except Exception:
            error_details = exc.response.text

        raise HTTPException(
            status_code=502,
            detail={
                "message": "Could not retrieve YouCam task status.",
                "upstream_status": exc.response.status_code,
                "upstream_error": error_details,
            },
        )

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to YouCam: {str(exc)}",
        )
class RecommendationRequest(BaseModel):
    results: dict
    concerns: Optional[list[str]] = []
    sensitivities: Optional[list[str]] = []


@app.post("/api/skin/recommendations")
async def get_skin_recommendations(request: RecommendationRequest):

    plan = generate_skincare_plan(
        youcam_results=request.results,
        concerns=request.concerns,
        sensitivities=request.sensitivities,
    )

    return {
        "success": True,
        "recommendations": plan,
    }