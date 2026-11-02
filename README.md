# SkinTwin — Your Skin's Digital Twin

SkinTwin is an AI-powered skincare guidance application that transforms facial skin analysis into practical, ingredient-focused skincare recommendations.

Users upload a selfie to receive skin analysis powered by the YouCam Skin Analysis API. SkinTwin then uses its own Python-based recommendation engine to suggest skincare ingredients and build simple morning and evening routines.

## Features

- **AI skin analysis:** Analyse an uploaded facial image using the YouCam Skin Analysis API.
- **Skin type detection:** Display detected skin type, including regional results when available.
- **Skin metrics:** View measurements for moisture, radiance, redness, oiliness, acne, texture, age spots, pores and wrinkles, depending on the API response.
- **Ingredient recommendations:** Receive skincare ingredient suggestions from SkinTwin's curated, rule-based recommendation engine.
- **Daily skincare routines:** Get morning and evening skincare steps.
- **Simple experience:** Follow a guided selfie upload and results experience.

## How it works

1. The user uploads a JPG or PNG selfie.
2. The FastAPI backend validates the image and sends it through the YouCam API workflow.
3. SkinTwin retrieves the completed skin analysis.
4. The frontend displays the returned analysis results.
5. SkinTwin's recommendation engine uses the detected skin type and available user concerns to generate ingredient suggestions and skincare routines.

**Technology distinction:** YouCam powers the skin analysis. SkinTwin's own Python recommendation engine generates the ingredient suggestions and routines.

## Technology stack

**Frontend**
- React
- Vite
- Axios
- Lucide React
- Recharts

**Backend**
- Python
- FastAPI
- HTTPX
- Pydantic

**Skin analysis**
- YouCam Skin Analysis API

**Recommendation engine**
- Python-based curated skincare ingredient rules

## Project structure

```text
skintwin/
├── backend/
│   ├── main.py
│   ├── recommendation_engine.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Getting started

### Prerequisites

- Python 3.11 or later
- Node.js 22 or later
- npm
- A YouCam API key

### 1. Clone the repository

```bash
git clone https://github.com/sukanya7777/skintwin.git
cd skintwin
```

### 2. Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create your local environment file:

```bash
cp .env.example .env
```

Add your YouCam API key to `backend/.env`:

```env
YOUCAM_API_KEY=your_youcam_api_key
FRONTEND_URL=http://localhost:5173
```

Never commit your `.env` file or expose your API key publicly.

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`.

Health check: `http://localhost:8000/api/health`

### 3. Set up the frontend

Open a second terminal:

```bash
cd skintwin/frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

## Environment variables

| Variable | Description |
|---|---|
| `YOUCAM_API_KEY` | Your YouCam API key |
| `FRONTEND_URL` | Frontend origin allowed by backend CORS |

The `.env.example` file contains placeholders. Configure valid credentials locally before using the skin analysis feature.

## Responsible use

SkinTwin provides general cosmetic skincare guidance and is not a medical diagnostic tool. Skin analysis measurements should be interpreted according to the API provider's metric definitions. Users should patch-test new skincare products and consult a qualified dermatologist for persistent or concerning skin problems.

## Hackathon project

Built for the YouCam API Skin AI & eCommerce VTO Hackathon.

**Repository:** https://github.com/sukanya7777/skintwin

## License

See the LICENSE file for license terms.