
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dashboard import router as dashboard_router
from auth import router as auth_router
from transactions import router as transaction_router
from budgets import router as budget_router
from ml_routes import router as ml_router
from forecast_routes import router as forecast_router
from insight_routes import router as insight_router
from chatbot_routes import router as chatbot_router
from currency_routes import router as currency_router


app = FastAPI(
    title="AI Finance Assistant API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transaction_router)
app.include_router(budget_router)
app.include_router(dashboard_router)
app.include_router(ml_router)
app.include_router(forecast_router)
app.include_router(insight_router)
app.include_router(chatbot_router)
app.include_router(currency_router)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "message": "AI Finance Assistant backend is running"
    }
