
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from chatbot import generate_chatbot_response


router = APIRouter(
    prefix="/api/chatbot",
    tags=["AI Finance Assistant"]
)


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000
    )


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    response = generate_chatbot_response(
        message=request.message,
        db=db,
        user_id=current_user.id
    )

    return response
