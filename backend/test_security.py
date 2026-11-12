
from security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

# Test password hashing
password = "TestPassword123"

hashed_password = hash_password(password)

print("Password hashing:", "SUCCESS" if hashed_password != password else "FAILED")

# Test password verification
is_valid = verify_password(password, hashed_password)

print("Password verification:", "SUCCESS" if is_valid else "FAILED")

# Test JWT token generation
token = create_access_token({"sub": "1"})

print("JWT generation:", "SUCCESS" if token else "FAILED")

# Test JWT token verification
decoded_data = decode_access_token(token)

print("JWT verification:", "SUCCESS" if decoded_data["sub"] == "1" else "FAILED")
