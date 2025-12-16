
import sys
import os
sys.path.append(os.getcwd())

print("Starting debug...")
try:
    from managers.config_manager import ConfigManager
    print("Imported ConfigManager")
    config = ConfigManager()
    print("Initialized ConfigManager")
    config._load_api_keys()
    print("Loaded API Keys manually")
except Exception as e:
    print(f"Error: {e}")
