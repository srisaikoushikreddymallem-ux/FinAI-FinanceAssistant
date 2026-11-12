
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from ml.predict import predict_category
from dependencies import get_current_user
from models import User


router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)


class CategoryPredictionRequest(BaseModel):
    description: str = Field(min_length=1, max_length=255)


class CategoryPredictionResponse(BaseModel):
    description: str
    predicted_category: str


@router.post(
    "/predict-category",
    response_model=CategoryPredictionResponse
)
def predict_transaction_category(
    request: CategoryPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        predicted_category = predict_category(request.description)

        return CategoryPredictionResponse(
            description=request.description,
            predicted_category=predicted_category
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to predict transaction category."
        )
