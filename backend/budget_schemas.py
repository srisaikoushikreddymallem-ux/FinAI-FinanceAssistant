
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


class BudgetCreate(BaseModel):
    category: str = Field(min_length=2, max_length=100)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2020, le=2100)


class BudgetUpdate(BaseModel):
    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )
    month: int | None = Field(
        default=None,
        ge=1,
        le=12
    )
    year: int | None = Field(
        default=None,
        ge=2000,
        le=2100
    )


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: Decimal
    month: int
    year: int

    model_config = ConfigDict(from_attributes=True)


class BudgetSummaryResponse(BaseModel):
    category: str
    budget_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    percentage_used: float
    over_budget: bool
