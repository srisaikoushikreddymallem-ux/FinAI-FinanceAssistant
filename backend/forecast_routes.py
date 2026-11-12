
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from database import get_db
from models import Transaction, Prediction, User
from dependencies import get_current_user
from ml.forecast import forecast_next_month


router = APIRouter(
    prefix="/api/forecast",
    tags=["Expense Forecasting"]
)


def get_months_before(current_date, number_of_months):
    """Return the first day of each preceding month."""

    months = []

    year = current_date.year
    month = current_date.month

    for _ in range(number_of_months):
        month -= 1

        if month == 0:
            month = 12
            year -= 1

        months.append(date(year, month, 1))

    return list(reversed(months))


def get_prediction_period(current_month_start):
    """Return the next calendar month and year."""

    prediction_month = current_month_start.month + 1
    prediction_year = current_month_start.year

    if prediction_month > 12:
        prediction_month = 1
        prediction_year += 1

    return prediction_month, prediction_year


def get_historical_months(monthly_records, current_month_start):
    """Prepare the available months within the latest six completed months."""

    earliest_record = min(
        date(int(row.year), int(row.month), 1)
        for row in monthly_records
    )

    six_month_window = get_months_before(current_month_start, 6)

    start_month = max(earliest_record, six_month_window[0])

    return [
        month for month in six_month_window
        if month >= start_month
    ]


def save_prediction(
    db,
    user_id,
    category,
    prediction_month,
    prediction_year,
    predicted_amount,
    model_version
):
    """Save a new prediction or update an existing one."""

    existing_prediction = db.query(Prediction).filter(
        Prediction.user_id == user_id,
        Prediction.category == category,
        Prediction.prediction_month == prediction_month,
        Prediction.prediction_year == prediction_year
    ).first()

    if existing_prediction:
        existing_prediction.predicted_amount = predicted_amount
        existing_prediction.model_version = model_version
    else:
        db.add(
            Prediction(
                user_id=user_id,
                category=category,
                predicted_amount=predicted_amount,
                prediction_month=prediction_month,
                prediction_year=prediction_year,
                model_version=model_version
            )
        )


@router.get("/monthly")
def forecast_monthly_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    current_month_start = date(today.year, today.month, 1)
    previous_month_end = current_month_start - timedelta(days=1)

    monthly_expenses = db.query(
        extract("year", Transaction.transaction_date).label("year"),
        extract("month", Transaction.transaction_date).label("month"),
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "expense",
        Transaction.transaction_date <= previous_month_end
    ).group_by(
        extract("year", Transaction.transaction_date),
        extract("month", Transaction.transaction_date)
    ).order_by(
        extract("year", Transaction.transaction_date),
        extract("month", Transaction.transaction_date)
    ).all()

    if not monthly_expenses:
        raise HTTPException(
            status_code=400,
            detail="Not enough completed historical expense data to generate a forecast."
        )

    historical_months = get_historical_months(
        monthly_expenses,
        current_month_start
    )

    expense_lookup = {
        (int(row.year), int(row.month)): float(row.total)
        for row in monthly_expenses
    }

    expense_values = [
        expense_lookup.get((month.year, month.month), 0.0)
        for month in historical_months
    ]

    forecast_result = forecast_next_month(expense_values)

    prediction_month, prediction_year = get_prediction_period(
        current_month_start
    )

    predicted_amount = Decimal(
        str(forecast_result["predicted_amount"])
    ).quantize(Decimal("0.01"))

    save_prediction(
        db,
        current_user.id,
        "Overall",
        prediction_month,
        prediction_year,
        predicted_amount,
        forecast_result["model_version"]
    )

    db.commit()

    return {
        "prediction_month": prediction_month,
        "prediction_year": prediction_year,
        "predicted_amount": predicted_amount,
        "currency": "INR",
        "model_version": forecast_result["model_version"],
        "historical_data": [
            {
                "month": month.month,
                "year": month.year,
                "actual_expenses": amount
            }
            for month, amount in zip(historical_months, expense_values)
        ]
    }


@router.get("/category-wise")
def forecast_category_wise_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    current_month_start = date(today.year, today.month, 1)
    previous_month_end = current_month_start - timedelta(days=1)

    category_expenses = db.query(
        Transaction.category.label("category"),
        extract("year", Transaction.transaction_date).label("year"),
        extract("month", Transaction.transaction_date).label("month"),
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "expense",
        Transaction.transaction_date <= previous_month_end
    ).group_by(
        Transaction.category,
        extract("year", Transaction.transaction_date),
        extract("month", Transaction.transaction_date)
    ).order_by(
        Transaction.category,
        extract("year", Transaction.transaction_date),
        extract("month", Transaction.transaction_date)
    ).all()

    if not category_expenses:
        raise HTTPException(
            status_code=400,
            detail="No completed historical expense data available for category-wise forecasting."
        )

    prediction_month, prediction_year = get_prediction_period(
        current_month_start
    )

    categories = sorted({
        row.category for row in category_expenses
    })

    category_results = []

    for category in categories:
        category_records = [
            row for row in category_expenses
            if row.category == category
        ]

        historical_months = get_historical_months(
            category_records,
            current_month_start
        )

        expense_lookup = {
            (int(row.year), int(row.month)): float(row.total)
            for row in category_records
        }

        expense_values = [
            expense_lookup.get((month.year, month.month), 0.0)
            for month in historical_months
        ]

        forecast_result = forecast_next_month(expense_values)

        predicted_amount = Decimal(
            str(forecast_result["predicted_amount"])
        ).quantize(Decimal("0.01"))

        save_prediction(
            db,
            current_user.id,
            category,
            prediction_month,
            prediction_year,
            predicted_amount,
            forecast_result["model_version"]
        )

        category_results.append({
            "category": category,
            "predicted_amount": predicted_amount,
            "model_version": forecast_result["model_version"],
            "historical_data": [
                {
                    "month": month.month,
                    "year": month.year,
                    "actual_expenses": amount
                }
                for month, amount in zip(historical_months, expense_values)
            ]
        })

    db.commit()

    return {
        "prediction_month": prediction_month,
        "prediction_year": prediction_year,
        "currency": "INR",
        "categories": category_results,
        "total_predicted_expenses": sum(
            (item["predicted_amount"] for item in category_results),
            Decimal("0.00")
        )
    }
