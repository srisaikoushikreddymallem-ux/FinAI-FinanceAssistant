import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "transaction_category_model.pkl")

test_transactions = [
    "swiggy dinner order",
    "uber cab ride",
    "monthly salary received",
    "electricity payment",
    "netflix monthly plan",
    "medical pharmacy purchase",
    "college course fees",
    "amazon clothes order"
]

print("Transaction Category Predictions")
print("--------------------------------")

for transaction in test_transactions:
    prediction = model.predict([transaction])[0]
    print(f"{transaction} -> {prediction}")