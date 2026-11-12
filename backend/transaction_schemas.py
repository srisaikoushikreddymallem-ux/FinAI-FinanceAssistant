
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict, model_validator


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    transaction_type: Literal["income", "expense"]
    category: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    transaction_date: date


class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None, gt=0, max_digits=12, decimal_places=2
    )
    transaction_type: Literal["income", "expense"] | None = None
    category: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    transaction_date: date | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_null_required_fields(cls, data):
        if isinstance(data, dict):
            required_fields = [
                "amount",
                "transaction_type",
                "category",
                "transaction_date"
            ]

            for field in required_fields:
                if field in data and data[field] is None:
                    raise ValueError(f"{field} cannot be null")

        return data


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    transaction_type: str
    category: str
    description: str | None
    transaction_date: date

    model_config = ConfigDict(from_attributes=True)
