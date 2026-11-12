# FinAI – AI-Powered Personal Finance Assistant

FinAI is a full-stack personal finance management application that helps users track income and expenses, manage budgets, analyze spending patterns and gain insights into their financial activities using machine learning.

## Features

- **User Authentication:** Secure registration and login using JWT authentication and password hashing.
- **Transaction Management:** Add, view, update, delete, search and filter income and expenses.
- **Budget Management:** Create and manage monthly budgets, monitor spending and identify overspending.
- **Interactive Dashboard:** Visualize income, expenses, balance and recent transactions.
- **Financial Analytics:** Analyze monthly financial trends and category-wise spending.
- **ML-Based Categorization:** Automatically predict transaction categories using machine learning.
- **Expense Forecasting:** Predict future expenses using historical spending patterns.
- **AI Financial Insights:** Generate personalized spending insights and budget alerts.
- **Finance Chatbot:** Interact with a rule-based chatbot to explore financial information.
- **Multi-Currency Support:** View financial information in INR, USD, EUR and GBP.
- **Responsive Interface:** Access the application across desktop, tablet and mobile devices.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Machine Learning | Scikit-learn |
| Authentication | JWT, Argon2 |
| Data Visualization | Recharts |
| API Communication | REST APIs |

## Project Structure

```text
ai-finance-assistant-starter/
│
├── backend/
│   ├── ml/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── dependencies.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## Requirements

- Python 3.12 or newer
- Node.js 20.19+ or 22.12+
- PostgreSQL 18
- npm

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-finance-assistant-starter
```

### 2. Backend Setup

Open the first terminal:

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Configure the backend environment variables in the `.env` file according to the application's configuration.

Create the PostgreSQL database:

```sql
CREATE DATABASE ai_finance_db;
```

Start the backend:

```powershell
python -m uvicorn main:app --reload
```

### 3. Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```


## Machine Learning

FinAI incorporates machine learning functionality for:

- Transaction category prediction based on transaction descriptions.
- Expense forecasting using historical transaction data.

The classification model uses Scikit-learn, while forecasting uses historical spending patterns and regression-based prediction where sufficient data is available.

## Security

- Password hashing using Argon2.
- JWT-based authentication.
- Protected API endpoints.
- User-specific transaction and budget access.
- Input validation using Pydantic.
- Environment-based configuration for sensitive credentials.

## API Documentation

FinAI provides RESTful APIs using FastAPI.

## Future Enhancements

- Improve ML model performance with additional transaction datasets.
- Enhance forecasting accuracy.
- Expand financial analytics and personalized insights.
- Introduce more advanced conversational finance assistance.
