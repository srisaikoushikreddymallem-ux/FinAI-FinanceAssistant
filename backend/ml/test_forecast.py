
from forecast import forecast_next_month


# Test 1: Historical expenses with an increasing trend
expenses = [8000, 9000, 10000, 11000, 12000]

result = forecast_next_month(expenses)

print("Test 1: Increasing Expenses")
print("Historical Expenses:", expenses)
print("Forecast:", result)


# Test 2: Historical expenses with limited data
expenses = [5000, 7000]

result = forecast_next_month(expenses)

print("\nTest 2: Limited Historical Data")
print("Historical Expenses:", expenses)
print("Forecast:", result)
