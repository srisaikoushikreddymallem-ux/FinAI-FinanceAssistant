
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case

from transaction_schemas import TransactionResponse


from database import get_db
from models import Transaction, User
from dependencies import get_current_user
from dashboard_schemas import (
    DashboardSummaryResponse,
    MonthlyAnalyticsResponse,
    CategoryExpenseResponse
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_income = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "income",
        extract("month", Transaction.transaction_date) == month,
        extract("year", Transaction.transaction_date) == year
    ).scalar()

    total_expenses = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "expense",
        extract("month", Transaction.transaction_date) == month,
        extract("year", Transaction.transaction_date) == year
    ).scalar()

    transaction_count = db.query(
        func.count(Transaction.id)
    ).filter(
        Transaction.user_id == current_user.id,
        extract("month", Transaction.transaction_date) == month,
        extract("year", Transaction.transaction_date) == year
    ).scalar()

    total_income = Decimal(str(total_income))
    total_expenses = Decimal(str(total_expenses))

    balance = total_income - total_expenses

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "transaction_count": transaction_count
    }






@router.get(
    "/monthly-analytics",
    response_model=list[MonthlyAnalyticsResponse]
)
def get_monthly_analytics(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        extract("month", Transaction.transaction_date).label("month"),

        func.sum(
            case(
                (Transaction.transaction_type == "income", Transaction.amount),
                else_=0
            )
        ).label("total_income"),

        func.sum(
            case(
                (Transaction.transaction_type == "expense", Transaction.amount),
                else_=0
            )
        ).label("total_expenses")

    ).filter(
        Transaction.user_id == current_user.id,
        extract("year", Transaction.transaction_date) == year
    ).group_by(
        extract("month", Transaction.transaction_date)
    ).all()

    monthly_data = {
        int(result.month): result
        for result in results
    }

    analytics = []

    for month in range(1, 13):
        result = monthly_data.get(month)

        analytics.append({
            "month": month,
            "total_income": Decimal(
                str(result.total_income)
            ) if result else Decimal("0.00"),

            "total_expenses": Decimal(
                str(result.total_expenses)
            ) if result else Decimal("0.00")
        })

    return analytics





@router.get(
    "/category-expenses",
    response_model=list[CategoryExpenseResponse]
)
def get_category_expenses(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total_expenses")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "expense",
        extract("month", Transaction.transaction_date) == month,
        extract("year", Transaction.transaction_date) == year
    ).group_by(
        Transaction.category
    ).all()

    total_spending = sum(
        (Decimal(str(result.total_expenses)) for result in results),
        Decimal("0.00")
    )

    category_data = []

    for result in results:
        amount = Decimal(str(result.total_expenses))

        percentage = float(
            (amount / total_spending) * 100
        ) if total_spending > 0 else 0.0

        category_data.append({
            "category": result.category,
            "total_expenses": amount,
            "percentage": round(percentage, 2)
        })

    return category_data



@router.get(
    "/recent-transactions",
    response_model=list[TransactionResponse]
)
def get_recent_transactions(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        Transaction.transaction_date.desc(),
        Transaction.id.desc()
    ).limit(limit).all()

    return transactions
