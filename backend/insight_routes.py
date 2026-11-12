
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Insight, User
from dependencies import get_current_user
from insights import generate_spending_insights


router = APIRouter(
    prefix="/api/insights",
    tags=["AI Spending Insights"]
)


@router.post("/generate")
def generate_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate and save financial insights for the logged-in user."""

    generated_insights = generate_spending_insights(
        db,
        current_user.id
    )

    saved_count = 0

    try:
        for item in generated_insights:
            # Avoid creating duplicate unread insights
            # with the same type, title and message.
            existing_insight = db.query(Insight).filter(
                Insight.user_id == current_user.id,
                Insight.insight_type == item["insight_type"],
                Insight.title == item["title"],
                Insight.message == item["message"],
                Insight.is_read == False
            ).first()

            if existing_insight:
                continue

            new_insight = Insight(
                user_id=current_user.id,
                insight_type=item["insight_type"],
                title=item["title"],
                message=item["message"],
                is_read=False
            )

            db.add(new_insight)
            saved_count += 1

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save generated insights."
        )

    return {
        "message": "Spending insights generated successfully.",
        "generated_count": len(generated_insights),
        "saved_count": saved_count,
        "insights": generated_insights
    }


@router.get("/")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve saved insights for the logged-in user."""

    insights = db.query(Insight).filter(
        Insight.user_id == current_user.id
    ).order_by(
        Insight.created_at.desc()
    ).all()

    return [
        {
            "id": item.id,
            "insight_type": item.insight_type,
            "title": item.title,
            "message": item.message,
            "is_read": item.is_read,
            "created_at": item.created_at
        }
        for item in insights
    ]


@router.patch("/{insight_id}/read")
def mark_insight_as_read(
    insight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark an insight as read."""

    insight = db.query(Insight).filter(
        Insight.id == insight_id,
        Insight.user_id == current_user.id
    ).first()

    if not insight:
        raise HTTPException(
            status_code=404,
            detail="Insight not found."
        )

    insight.is_read = True
    db.commit()

    return {
        "message": "Insight marked as read.",
        "insight_id": insight.id,
        "is_read": insight.is_read
    }


@router.delete("/{insight_id}")
def delete_insight(
    insight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an insight belonging to the logged-in user."""

    insight = db.query(Insight).filter(
        Insight.id == insight_id,
        Insight.user_id == current_user.id
    ).first()

    if not insight:
        raise HTTPException(
            status_code=404,
            detail="Insight not found."
        )

    db.delete(insight)
    db.commit()

    return {
        "message": "Insight deleted successfully.",
        "insight_id": insight_id
    }
