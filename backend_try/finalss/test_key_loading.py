import os
import sys
from pathlib import Path

from managers.config_manager import ConfigManager

def test_key_loading():
    print("Testing ConfigManager Key Loading...")
    
    # Initialize ConfigManager (it will load .env internally when keys are accessed)
    config = ConfigManager()
    
    # Trigger key loading
    try:
        client = config.get_google_client()
        print("✅ get_google_client() successful")
    except Exception as e:
        print(f"❌ get_google_client() failed: {e}")

    # Check loaded keys
    if hasattr(config, 'google_keys'):
        print(f"🔑 Loaded Google Keys Count: {len(config.google_keys)}")
        for i, key in enumerate(config.google_keys):
            masked_key = key[:4] + "*" * (len(key) - 8) + key[-4:] if len(key) > 8 else "****"
            print(f"   Key {i+1}: {masked_key}")
    else:
        print("❌ google_keys attribute not found")

    if hasattr(config, 'eleven_keys'):
        print(f"🔑 Loaded ElevenLabs Keys Count: {len(config.eleven_keys)}")
        for i, key in enumerate(config.eleven_keys):
            masked_key = key[:4] + "*" * (len(key) - 8) + key[-4:] if len(key) > 8 else "****"
            print(f"   Key {i+1}: {masked_key}")
    else:
        print("❌ eleven_keys attribute not found")

    # Test Rotation
    print("\nTesting Rotation Logic...")
    initial_idx = config.current_google_idx
    print(f"Initial Index: {initial_idx}")
    
    if config.rotate_google_key():
        print(f"✅ Rotation successful. New Index: {config.current_google_idx}")
        if config.current_google_idx != initial_idx + 1:
             print("❌ Index did not increment correctly")
    else:
        print("⚠️ Rotation returned False (Expected if only 1 key or at end of list)")

if __name__ == "__main__":
    test_key_loading()
