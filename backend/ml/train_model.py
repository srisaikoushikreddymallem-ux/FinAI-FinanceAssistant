import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


# Get the current directory
BASE_DIR = Path(__file__).resolve().parent

# Load training dataset
data = pd.read_csv(BASE_DIR / "training_data.csv")

# Separate input and output
X = data["description"]
y = data["category"]

# Split dataset into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

# Create machine learning pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2)
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    ))
])

# Train the model
model.fit(X_train, y_train)

# Predict test data
predictions = model.predict(X_test)

# Evaluate model
accuracy = accuracy_score(y_test, predictions)

print("Model Training Completed!")
print("-------------------------")
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))

# Save trained model
joblib.dump(model, BASE_DIR / "transaction_category_model.pkl")

print("\nModel saved successfully!")