#!/bin/bash

# Activate venv and start server
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
