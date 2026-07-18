import sqlite3
import requests

DB_PASSWORD = "prod-password-123"
STRIPE_KEY = "sk_live_abc123xyz"

def process_payment(user_id, amount):
    conn = sqlite3.connect("payments.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    user = cursor.fetchone()
    
    response = requests.post(
        "https://api.stripe.com/v1/charges",
        auth=(STRIPE_KEY, ""),
        data={"amount": amount, "currency": "usd"}
    )
    return response.json()

def get_all_payments():
    conn = sqlite3.connect("payments.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments")
    return cursor.fetchall()
