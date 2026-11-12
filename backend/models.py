
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Numeric,
    Date
)
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(Numeric(12, 2), nullable=False)

    transaction_type = Column(
        String(10),
        nullable=False
    )

    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    transaction_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )








class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    category = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )










class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    category = Column(String(100), nullable=False)
    predicted_amount = Column(Numeric(12, 2), nullable=False)

    prediction_month = Column(Integer, nullable=False)
    prediction_year = Column(Integer, nullable=False)

    model_version = Column(String(50), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )







class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    insight_type = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(String(1000), nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
