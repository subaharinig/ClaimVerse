# ClaimVerse

AI-Powered Insurance Claims Processing System with FastAPI, React, and UiPath RPA integration.

## Architecture

```
ClaimVerse/
├── backend/           # FastAPI + Agentic AI
├── frontend/          # React SPA
├── uipath/            # RPA workflows
└── data/              # Sample data
```

## Quick Start

### Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

- AI-powered claim analysis using agents
- Rule-based decision engine
- Automated low-risk claim approval
- UiPath RPA integration for claim execution
- Real-time claim status tracking

## API Endpoints

- `POST /api/claims/` - Submit new claim
- `GET /api/claims/` - List all claims
- `GET /api/claims/{id}` - Get claim details
- `GET /health` - Health check