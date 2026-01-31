#!/bin/bash

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt
deactivate
