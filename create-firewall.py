#!/usr/bin/env python3
"""
Create a firewall rule for TCP port 8078 in Google Cloud
Requires Google Cloud authentication via gcloud CLI or default credentials
"""
import subprocess
import json
import sys

# Project configuration
PROJECT_ID = "handson-smartbin"
ZONE = "us-central1-a"
INSTANCE_NAME = "smartbin"
NETWORK = "default"
FIREWALL_NAME = "allow-device-tcp-8078"
PORT = 8078

def create_firewall_rule():
    """Create a firewall rule allowing TCP 8078"""
    try:
        # Try using gcloud if available
        cmd = [
            "gcloud", "compute", "firewall-rules", "create", FIREWALL_NAME,
            f"--project={PROJECT_ID}",
            f"--allow=tcp:{PORT}",
            "--source-ranges=0.0.0.0/0",
            f"--network={NETWORK}",
            "--description=Allow HY-CKX1 device TCP connections"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Firewall rule '{FIREWALL_NAME}' created successfully")
            print(result.stdout)
            return True
        else:
            print(f"❌ Error: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ gcloud CLI not found. Install Google Cloud SDK.")
        return False

if __name__ == "__main__":
    create_firewall_rule()
