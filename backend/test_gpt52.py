#!/usr/bin/env python3
"""
Test script for GPT-5.2 API
Tests if GPT-5.2 works with our API key using the new responses.create() API

Usage:
    cd backend
    source venv/bin/activate  # or activate your virtual environment
    python test_gpt52.py
"""

import sys
from pathlib import Path

# Read .env file directly
env_path = Path(__file__).parent / ".env"
api_key = None

if env_path.exists():
    with open(env_path, "r") as f:
        for line in f:
            if line.startswith("OPENAI_API_KEY="):
                api_key = line.split("=", 1)[1].strip()
                break

if not api_key:
    print("ERROR: OPENAI_API_KEY not found in .env file")
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("ERROR: openai package not found. Please install dependencies:")
    print("  cd backend")
    print("  source venv/bin/activate")
    print("  pip install -r requirements.txt")
    sys.exit(1)

print(f"Using API Key: {api_key[:20]}...")
print("\n" + "=" * 80)
print("Testing GPT-5.2 API")
print("=" * 80 + "\n")

client = OpenAI(api_key=api_key)

try:
    print("Sending test request to gpt-5.2...")
    print("Query: 'What is 2+2? Answer briefly.'\n")
    
    response = client.responses.create(
        model="gpt-5.2",
        input="What is 2+2? Answer briefly.",
        reasoning={
            "effort": "none"
        },
        text={
            "verbosity": "low"
        }
    )
    
    print("=" * 80)
    print("SUCCESS! GPT-5.2 API Response:")
    print("=" * 80)
    print(response)
    print("\n" + "=" * 80)
    print("Response type:", type(response))
    print("=" * 80)
    
    # Try to extract text if available
    if hasattr(response, 'output'):
        print("\nOutput:", response.output)
    elif hasattr(response, 'text'):
        print("\nText:", response.text)
    elif hasattr(response, 'content'):
        print("\nContent:", response.content)
    elif hasattr(response, 'choices') and len(response.choices) > 0:
        print("\nChoices:", response.choices)
    
except Exception as e:
    print("=" * 80)
    print("ERROR occurred:")
    print("=" * 80)
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")
    print("\nFull error details:")
    import traceback
    traceback.print_exc()
    sys.exit(1)
