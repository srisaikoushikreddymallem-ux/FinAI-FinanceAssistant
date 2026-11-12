
from decimal import Decimal
from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    balance: Decimal
    transaction_count: int










class MonthlyAnalyticsResponse(BaseModel):
    month: int
    total_income: Decimal
    total_expenses: Decimal






class CategoryExpenseResponse(BaseModel):
    category: str
    total_expenses: Decimal
    percentage: float
