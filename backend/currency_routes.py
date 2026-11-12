
import httpx

from fastapi import APIRouter, Depends, HTTPException, Query

from dependencies import get_current_user
from services.currency_service import (
    get_exchange_rates,
    convert_from_inr
)

router = APIRouter(
    prefix="/api/currency",
    tags=["Currency"]
)


@router.get("/rates")
async def currency_rates(
    current_user=Depends(get_current_user)
):
    try:
        rates = await get_exchange_rates()

        return {
            "base_currency": "INR",
            "rates": rates
        }

    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch exchange rates."
        )


@router.get("/convert")
async def convert_currency(
    amount: float = Query(..., ge=0),
    target_currency: str = Query(...),
    current_user=Depends(get_current_user)
):
    try:
        target_currency = target_currency.upper()

        converted_amount = await convert_from_inr(
            amount,
            target_currency
        )

        return {
            "base_currency": "INR",
            "target_currency": target_currency,
            "original_amount": amount,
            "converted_amount": converted_amount
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch exchange rates."
        )
