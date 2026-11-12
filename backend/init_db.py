
import models
from database import Base, engine

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")

for table in Base.metadata.sorted_tables:
    print("Table:", table.name)
