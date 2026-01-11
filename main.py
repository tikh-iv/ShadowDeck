import os
import asyncio
from settings import SettingsManager
import decky

settings_dir = os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "/tmp/decky-plugin-settings")
settings = SettingsManager(name="shadowsocks", settings_directory=settings_dir)
settings.read()

class Plugin:
    def __init__(self):
        self.enabled = False
        decky.logger.info(f"[BACKEND] Plugin initialized with enabled={self.enabled}")
    
    async def start_shadowsocks(self):
        decky.logger.info("[BACKEND] START SHADOWSOCKS called")
        self.enabled = True
        decky.logger.info(f"[BACKEND] Enabled set to {self.enabled}")
        return True
    
    async def stop_shadowsocks(self):
        decky.logger.info("[BACKEND] STOP SHADOWSOCKS called")
        self.enabled = False
        decky.logger.info(f"[BACKEND] Enabled set to {self.enabled}")
        return True
    
    async def get_enabled_state(self):
        decky.logger.info(f"[BACKEND] get_enabled_state called, returning: {self.enabled}")
        return self.enabled
    
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("ShadowSocks Plugin loaded!")
        
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
    
    async def _unload(self):
        decky.logger.info("ShadowSocks Plugin unloaded!")
        pass
    
    async def _uninstall(self):
        decky.logger.info("ShadowSocks Plugin uninstalled!")
        pass
    
    async def set_setting(self, key: str, value):
        decky.logger.info(f"Setting {key} to {value}")
        settings.setSetting(key, value)
        success = settings.commit()
        return success
    
    async def get_all_settings(self):
        server = settings.getSetting("server", "example.com")
        port = settings.getSetting("port", 8388)
        method = settings.getSetting("method", "chacha20-ietf-poly1305")
        password = settings.getSetting("password", "")
        
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
    
    async def _migration(self):
        decky.logger.info("Migrating ShadowSocks settings")
        pass