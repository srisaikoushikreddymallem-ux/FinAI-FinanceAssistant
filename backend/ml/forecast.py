
import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_next_month(monthly_expenses):
    """
    Forecast next month's expenses using historical
    monthly expense amounts.

    Uses Linear Regression when at least 3 months
    of historical data are available.

    Otherwise, uses the historical average.
    """

    if not monthly_expenses:
        raise ValueError("No historical expense data available.")

    expenses = np.array(monthly_expenses, dtype=float)

    if np.any(~np.isfinite(expenses)) or np.any(expenses < 0):
        raise ValueError("Expense amounts must be valid non-negative numbers.")

    # Use historical average when data is insufficient
    if len(expenses) < 3:
        predicted_amount = float(np.mean(expenses))
        model_version = "historical_average_v1"

    else:
        # Prepare month numbers
        X = np.arange(len(expenses)).reshape(-1, 1)

        # Prepare expense amounts
        y = expenses

        # Train Linear Regression model
        model = LinearRegression()
        model.fit(X, y)

        # Predict the next month
        next_month = np.array([[len(expenses)]])
        predicted_amount = float(model.predict(next_month)[0])

        model_version = "linear_regression_v1"

    # Expenses cannot be negative
    predicted_amount = max(0.0, predicted_amount)

    return {
        "predicted_amount": round(predicted_amount, 2),
        "model_version": model_version
    }
