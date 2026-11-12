
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from decimal import Decimal

from database import get_db
from models import Budget, Transaction, User
from dependencies import get_current_user
from budget_schemas import (
    BudgetCreate,
    BudgetResponse,
    BudgetUpdate,
    BudgetSummaryResponse
)

router = APIRouter(
    prefix="/api/budgets",
    tags=["Budgets"]
)


@router.post(
    "/",
    response_model=BudgetResponse,
    status_code=status.HTTP_201_CREATED
)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == budget_data.category,
        Budget.month == budget_data.month,
        Budget.year == budget_data.year
    ).first()

    if existing_budget:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Budget already exists for this category and month"
        )

    new_budget = Budget(
        user_id=current_user.id,
        category=budget_data.category,
        amount=budget_data.amount,
        month=budget_data.month,
        year=budget_data.year
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget









@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).order_by(
        Budget.year.desc(),
        Budget.month.desc(),
        Budget.category.asc()
    ).all()

    return budgets






@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    update_data = budget_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided"
        )

    if any(value is None for value in update_data.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Budget fields cannot be null"
        )

    new_category = update_data.get("category", budget.category)
    new_month = update_data.get("month", budget.month)
    new_year = update_data.get("year", budget.year)

    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == new_category,
        Budget.month == new_month,
        Budget.year == new_year,
        Budget.id != budget_id
    ).first()

    if existing_budget:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Budget already exists for this category and month"
        )

    for key, value in update_data.items():
        setattr(budget, key, value)

    db.commit()
    db.refresh(budget)

    return budget



@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }


@router.get("/summary", response_model=list[BudgetSummaryResponse])
def get_budget_summary(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).all()

    summary = []

    for budget in budgets:
        spent_amount = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.user_id == current_user.id,
            Transaction.category == budget.category,
            Transaction.transaction_type == "expense",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year
        ).scalar()

        spent_amount = Decimal(str(spent_amount))
        remaining_amount = budget.amount - spent_amount

        percentage_used = float(
            (spent_amount / budget.amount) * 100
        )

        summary.append({
            "category": budget.category,
            "budget_amount": budget.amount,
            "spent_amount": spent_amount,
            "remaining_amount": remaining_amount,
            "percentage_used": round(percentage_used, 2),
            "over_budget": spent_amount > budget.amount
        })

    return summary
