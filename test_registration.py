import requests
import json

# Test registration endpoint
url = "http://127.0.0.1:8000/auth1/register/"
data = {
    "name": "Test User Frontend",
    "email": "frontend@example.com", 
    "password": "testpass123",
    "role": "consumer",
    "wallet_address": "0x2222222222222222222222222222222222222222"
}

print("Testing registration endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code < 400:
        print("✅ Registration successful!")
    else:
        print("❌ Registration failed!")
        
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {e}")
