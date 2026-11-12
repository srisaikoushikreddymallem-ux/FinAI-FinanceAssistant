import joblib

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "transaction_category_model.pkl"

# Load the trained model
model = joblib.load(MODEL_PATH)


def predict_category(description: str) -> str:
    """
    Predict the category of a transaction
    using its description.
    """

    if not description or not description.strip():
        raise ValueError("Transaction description cannot be empty.")

    prediction = model.predict([description.strip()])

    return str(prediction[0])