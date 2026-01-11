# main.py
import os
import asyncio
from settings import SettingsManager

import decky

# Get environment variable
settings_dir = os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "/tmp/decky-plugin-settings")
settings = SettingsManager(name="shadowsocks", settings_directory=settings_dir)
settings.read()

class Plugin:
    def __init__(self):
        # In-memory only, not saved to settings
        self.enabled = False
        decky.logger.info(f"[BACKEND] Plugin initialized with enabled={self.enabled}")

    async def start_shadowsocks(self):
        decky.logger.info("[BACKEND] START SHADOWSOCKS called")
        # TODO: Add actual ShadowSocks startup code here
        self.enabled = True
        decky.logger.info(f"[BACKEND] Enabled set to {self.enabled}")
        return True

    async def stop_shadowsocks(self):
        decky.logger.info("[BACKEND] STOP SHADOWSOCKS called")
        # TODO: Add actual ShadowSocks shutdown code here
        self.enabled = False
        decky.logger.info(f"[BACKEND] Enabled set to {self.enabled}")
        return True

    async def get_enabled_state(self):
        """Get current enabled state (read-only)"""
        decky.logger.info(f"[BACKEND] get_enabled_state called, returning: {self.enabled}")
        return self.enabled
    
    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("ShadowSocks Plugin loaded!")
        
        # Initialize default settings if they don't exist
        default_settings = {
            "server": "example.com",
            "port": 8388,
            "method": "chacha20-ietf-poly1305",
            "password": ""
        }
        
        for key, value in default_settings.items():
            if settings.getSetting(key) is None:
                decky.logger.info(f"Initializing default {key}: {value}")
                settings.setSetting(key, value)
        
        settings.commit()

    # Function called first during the unload process
    async def _unload(self):
        decky.logger.info("ShadowSocks Plugin unloaded!")
        pass

    # Function called after `_unload` during uninstall
    async def _uninstall(self):
        decky.logger.info("ShadowSocks Plugin uninstalled!")
        pass

    # Settings management methods
    async def set_setting(self, key: str, value):
        """Set a setting value"""
        decky.logger.info(f"Setting {key} to {value}")
        settings.setSetting(key, value)
        success = settings.commit()
        return success

    async def get_all_settings(self):
        """Get all settings as a dictionary"""
        server = settings.getSetting("server", "example.com")
        port = settings.getSetting("port", 8388)
        method = settings.getSetting("method", "chacha20-ietf-poly1305")
        password = settings.getSetting("password", "")
        
        # Ensure port is integer
        if not isinstance(port, int):
            try:
                port = int(port)
            except (ValueError, TypeError):
                port = 8388
        
        return {
            "server": str(server),
            "port": port,
            "method": str(method),
            "password": str(password)
        }

    # Migrations that should be performed before entering `_main()`
    async def _migration(self):
        decky.logger.info("Migrating ShadowSocks settings")
        # Example migration - you can add your migration logic here
        pass