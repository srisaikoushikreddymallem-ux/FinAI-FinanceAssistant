
from datetime import date
from decimal import Decimal

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from models import Transaction, Budget


def generate_spending_insights(db: Session, user_id: int):
    """Generate financial insights using the user's transactions and budgets."""

    insights = []

    today = date.today()
    current_month = today.month
    current_year = today.year

    # --------------------------------------------------
    # 1. Retrieve current month's income and expenses
    # --------------------------------------------------

    monthly_totals = db.query(
        Transaction.transaction_type,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        extract("month", Transaction.transaction_date) == current_month,
        extract("year", Transaction.transaction_date) == current_year
    ).group_by(
        Transaction.transaction_type
    ).all()

    income = 0.0
    expenses = 0.0

    for row in monthly_totals:
        if row.transaction_type == "income":
            income = float(row.total or 0)

        elif row.transaction_type == "expense":
            expenses = float(row.total or 0)

    # --------------------------------------------------
    # 2. Highest spending category
    # --------------------------------------------------

    category_totals = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        extract("month", Transaction.transaction_date) == current_month,
        extract("year", Transaction.transaction_date) == current_year
    ).group_by(
        Transaction.category
    ).order_by(
        func.sum(Transaction.amount).desc()
    ).all()

    if category_totals:
        highest_category = category_totals[0]

        insights.append({
            "insight_type": "highest_spending",
            "title": "Highest Spending Category",
            "message": (
                f"Your highest spending category this month is "
                f"{highest_category.category}, with expenses of "
                f"₹{float(highest_category.total):,.2f}."
            )
        })

    # --------------------------------------------------
    # 3. Monthly expense comparison
    # --------------------------------------------------

    previous_month = current_month - 1
    previous_year = current_year

    if previous_month == 0:
        previous_month = 12
        previous_year -= 1

    previous_expenses = db.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        extract("month", Transaction.transaction_date) == previous_month,
        extract("year", Transaction.transaction_date) == previous_year
    ).scalar()

    previous_expenses = float(previous_expenses or 0)

    if previous_expenses > 0:
        expense_change = (
            (expenses - previous_expenses) / previous_expenses
        ) * 100

        if expense_change > 0:
            insights.append({
                "insight_type": "expense_increase",
                "title": "Monthly Expenses Increased",
                "message": (
                    f"Your expenses increased by {expense_change:.1f}% "
                    f"compared with last month."
                )
            })

        elif expense_change < 0:
            insights.append({
                "insight_type": "expense_decrease",
                "title": "Monthly Expenses Decreased",
                "message": (
                    f"Your expenses decreased by {abs(expense_change):.1f}% "
                    f"compared with last month."
                )
            })

        else:
            insights.append({
                "insight_type": "expense_stable",
                "title": "Monthly Expenses Unchanged",
                "message": "Your expenses are unchanged compared with last month."
            })

    # --------------------------------------------------
    # 4. Savings rate
    # --------------------------------------------------

    if income > 0:
        savings = income - expenses
        savings_rate = (savings / income) * 100

        if savings_rate >= 20:
            message = (
                f"Great work! Your savings rate this month is "
                f"{savings_rate:.1f}%. You have saved "
                f"₹{savings:,.2f} from your income."
            )

        elif savings_rate > 0:
            message = (
                f"Your savings rate this month is {savings_rate:.1f}%. "
                f"Consider reviewing your expenses to increase your savings."
            )

        else:
            message = (
                f"Your expenses exceed your income by "
                f"₹{abs(savings):,.2f} this month. "
                f"Review your spending to improve your financial balance."
            )

        insights.append({
            "insight_type": "savings_rate",
            "title": "Monthly Savings Analysis",
            "message": message
        })

    # --------------------------------------------------
    # 5. Budget warnings and overspending
    # --------------------------------------------------

    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == current_month,
        Budget.year == current_year
    ).all()

    for budget in budgets:

        category_spending = db.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.category == budget.category,
            extract("month", Transaction.transaction_date) == current_month,
            extract("year", Transaction.transaction_date) == current_year
        ).scalar()

        spent = float(category_spending or 0)
        budget_amount = float(budget.amount)

        if budget_amount <= 0:
            continue

        utilization = (spent / budget_amount) * 100

        if utilization > 100:
            insights.append({
                "insight_type": "budget_exceeded",
                "title": f"{budget.category} Budget Exceeded",
                "message": (
                    f"You have exceeded your {budget.category} budget by "
                    f"₹{spent - budget_amount:,.2f}. "
                    f"You have spent {utilization:.1f}% of your budget."
                )
            })

        elif utilization >= 80:
            insights.append({
                "insight_type": "budget_warning",
                "title": f"{budget.category} Budget Warning",
                "message": (
                    f"You have used {utilization:.1f}% of your "
                    f"{budget.category} budget. "
                    f"Remaining budget: ₹{budget_amount - spent:,.2f}."
                )
            })

    return insights
