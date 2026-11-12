
import time
import httpx

BASE_CURRENCY = "INR"

SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "GBP"]

API_URL = "https://api.frankfurter.dev/v1/latest"

CACHE_DURATION = 3600  # 1 hour

_cached_rates = None
_cache_time = 0


async def get_exchange_rates():
    global _cached_rates, _cache_time

    current_time = time.monotonic()

    # Return cached rates if they are still valid
    if (
        _cached_rates is not None
        and current_time - _cache_time < CACHE_DURATION
    ):
        return _cached_rates

    params = {
        "base": BASE_CURRENCY,
        "symbols": "USD,EUR,GBP"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(API_URL, params=params)
        response.raise_for_status()

        data = response.json()

    rates = data.get("rates", {})

    if not all(currency in rates for currency in ["USD", "EUR", "GBP"]):
        raise ValueError("Exchange rates are incomplete.")

    _cached_rates = {
        "INR": 1.0,
        **{
            currency: float(rates[currency])
            for currency in ["USD", "EUR", "GBP"]
        }
    }

    _cache_time = current_time

    return _cached_rates


async def convert_from_inr(amount, target_currency):
    if target_currency not in SUPPORTED_CURRENCIES:
        raise ValueError("Unsupported currency.")

    rates = await get_exchange_rates()

    converted_amount = float(amount) * rates[target_currency]

    return round(converted_amount, 2)
