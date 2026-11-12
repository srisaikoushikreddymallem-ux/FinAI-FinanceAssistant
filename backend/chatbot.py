
import calendar
import re
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Transaction, Budget


MONTHS = {
    name.lower(): number
    for number, name in enumerate(calendar.month_name)
    if name
}


def get_requested_period(message: str):
    today = date.today()

    month = today.month
    year = today.year

    for name, number in MONTHS.items():
        if re.search(rf"\b{name}\b", message.lower()):
            month = number
            break

    year_match = re.search(r"\b(20\d{2})\b", message)

    if year_match:
        year = int(year_match.group(1))

    return month, year


def get_monthly_totals(
    db: Session,
    user_id: int,
    month: int,
    year: int
):
    transactions = db.query(
        Transaction.transaction_type,
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == user_id,
        func.extract("month", Transaction.transaction_date) == month,
        func.extract("year", Transaction.transaction_date) == year
    ).group_by(
        Transaction.transaction_type
    ).all()

    income = Decimal("0.00")
    expenses = Decimal("0.00")

    for transaction_type, amount in transactions:
        if transaction_type == "income":
            income = Decimal(str(amount))
        elif transaction_type == "expense":
            expenses = Decimal(str(amount))

    return income, expenses


def get_category_expenses(
    db: Session,
    user_id: int,
    month: int,
    year: int
):
    return db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        func.extract("month", Transaction.transaction_date) == month,
        func.extract("year", Transaction.transaction_date) == year
    ).group_by(
        Transaction.category
    ).order_by(
        func.sum(Transaction.amount).desc()
    ).all()


def get_budget_details(
    db: Session,
    user_id: int,
    month: int,
    year: int
):
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year
    ).all()

    details = []

    for budget in budgets:
        spent = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.user_id == user_id,
            Transaction.category == budget.category,
            Transaction.transaction_type == "expense",
            func.extract("month", Transaction.transaction_date) == month,
            func.extract("year", Transaction.transaction_date) == year
        ).scalar()

        spent = Decimal(str(spent))
        amount = Decimal(str(budget.amount))

        details.append({
            "category": budget.category,
            "budget": amount,
            "spent": spent,
            "remaining": amount - spent,
            "percentage": (
                float((spent / amount) * 100)
                if amount > 0 else 0
            )
        })

    return details


def format_amount(amount: Decimal) -> str:
    return f"₹{amount:,.2f}"


def generate_chatbot_response(
    message: str,
    db: Session,
    user_id: int
):
    if not message or not message.strip():
        return {
            "reply": "Please enter a question about your finances."
        }

    question = message.strip().lower()

    month, year = get_requested_period(question)
    month_name = calendar.month_name[month]

    income, expenses = get_monthly_totals(
        db, user_id, month, year
    )

    balance = income - expenses

    # Greeting
    if re.search(r"\b(hi|hello|hey)\b", question):
        return {
            "reply": (
                "Hello! I'm your AI Finance Assistant. "
                "You can ask me about your income, expenses, "
                "savings, budgets and spending habits."
            )
        }

    categories = get_category_expenses(
        db, user_id, month, year
    )

    # Financial recommendations
    if any(word in question for word in [
        "advice",
        "suggestion",
        "suggest",
        "improve",
        "reduce",
        "tips",
        "recommendation",
        "save more"
    ]):
        if expenses == 0:
            return {
                "reply": (
                    f"You have no recorded expenses for "
                    f"{month_name} {year}. Continue recording "
                    "your transactions to receive useful "
                    "spending recommendations."
                )
            }

        if income > 0 and expenses > income:
            return {
                "reply": (
                    "Your expenses are higher than your income. "
                    "Review discretionary spending, identify "
                    "your highest expense categories and set "
                    "realistic category budgets."
                )
            }

        if categories:
            highest_category, highest_amount = categories[0]

            return {
                "reply": (
                    f"Your highest spending category is "
                    f"{highest_category}, at "
                    f"{format_amount(Decimal(str(highest_amount)))}. "
                    "Review non-essential purchases in this "
                    "category and set a monthly spending limit."
                )
            }

        return {
            "reply": (
                "Start by tracking your daily expenses, "
                "setting category-wise budgets and reviewing "
                "your spending every week."
            )
        }

    # Budget questions
    if "budget" in question:
        budgets = get_budget_details(
            db, user_id, month, year
        )

        if not budgets:
            return {
                "reply": (
                    f"You haven't created any budgets for "
                    f"{month_name} {year}."
                )
            }

        exceeded = [
            item for item in budgets
            if item["spent"] > item["budget"]
        ]

        if any(word in question for word in [
            "exceed", "exceeded", "over", "cross"
        ]):
            if not exceeded:
                return {
                    "reply": (
                        f"Great! You haven't exceeded any "
                        f"category budgets in {month_name} {year}."
                    )
                }

            details = [
                f"{item['category']}: "
                f"spent {format_amount(item['spent'])} "
                f"against {format_amount(item['budget'])}"
                for item in exceeded
            ]

            return {
                "reply": (
                    "You have exceeded these budgets:\n"
                    + "\n".join(details)
                )
            }

        details = []

        for item in budgets:
            details.append(
                f"{item['category']}: "
                f"{format_amount(item['spent'])} spent out of "
                f"{format_amount(item['budget'])} "
                f"({item['percentage']:.1f}% used)"
            )

        return {
            "reply": (
                f"Here is your budget summary for "
                f"{month_name} {year}:\n"
                + "\n".join(details)
            )
        }

    # Highest spending category
    if any(word in question for word in [
        "highest", "most", "maximum", "largest", "top"
    ]) and any(word in question for word in [
        "category", "spending", "expense", "spent"
    ]):
        if not categories:
            return {
                "reply": (
                    f"You have no recorded expenses for "
                    f"{month_name} {year}."
                )
            }

        category, total = categories[0]

        return {
            "reply": (
                f"Your highest spending category in "
                f"{month_name} {year} is {category}, "
                f"with expenses of "
                f"{format_amount(Decimal(str(total)))}."
            )
        }

    # Category-specific spending
    for category, total in categories:
        if category.lower() in question:
            if any(word in question for word in [
                "spend", "spent", "expense", "expenses"
            ]):
                return {
                    "reply": (
                        f"You spent "
                        f"{format_amount(Decimal(str(total)))} "
                        f"on {category} in {month_name} {year}."
                    )
                }

    # Savings questions
    if any(word in question for word in [
        "saving", "savings", "balance", "left"
    ]):
        if income == 0 and expenses == 0:
            return {
                "reply": (
                    f"No income or expense transactions are "
                    f"recorded for {month_name} {year}."
                )
            }

        savings_rate = (
            float((balance / income) * 100)
            if income > 0 else 0
        )

        return {
            "reply": (
                f"For {month_name} {year}:\n"
                f"Income: {format_amount(income)}\n"
                f"Expenses: {format_amount(expenses)}\n"
                f"Remaining balance: {format_amount(balance)}\n"
                f"Savings rate: {savings_rate:.2f}%"
            )
        }

    # Income questions
    if any(word in question for word in [
        "income", "earned", "earning", "salary"
    ]):
        return {
            "reply": (
                f"Your total income for {month_name} {year} "
                f"is {format_amount(income)}."
            )
        }

    # Expense questions
    if any(word in question for word in [
        "expense", "expenses", "spend", "spent", "spending"
    ]):
        return {
            "reply": (
                f"Your total expenses for {month_name} {year} "
                f"are {format_amount(expenses)}."
            )
        }

    # Default response
    return {
        "reply": (
            "I'm your personal AI Finance Assistant, so I specialise "
            "in questions about your finances. \n\n"
            "You can ask me about:\n"
            "• Monthly income and expenses\n"
            "• Savings and remaining balance\n"
            "• Highest spending categories\n"
            "• Budget summaries and overspending\n"
            "• Tips to manage and reduce expenses\n\n"
            "What would you like to know about your finances?"
        )
    }
