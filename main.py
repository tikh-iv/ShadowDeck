import os
import asyncio
import urllib.request
import ssl
import shutil
from settings import SettingsManager
import decky_plugin
from shadowdeck.singbox_manager import SingBoxManager

settings_dir = os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "/tmp/decky-plugin-settings")
settings = SettingsManager(name="shadowsocks", settings_directory=settings_dir)
settings.read()

SINGBOX_ARCHIVE_NAME = "sing-box-1.12.15-linux-amd64.tar.gz"

class Plugin:
    def __init__(self):
        self.singbox_manager = SingBoxManager()  # Initialize the manager
        decky_plugin.logger.info("[BACKEND] Plugin initialized.")
    
    async def start_shadowsocks(self):
        decky_plugin.logger.info("[BACKEND] START SHADOWSOCKS called")
        
        # 1. Get user settings from the frontend
        server = settings.getSetting("server", "example.com")
        port = settings.getSetting("port", 8388)
        method = settings.getSetting("method", "chacha20-ietf-poly1305")
        password = settings.getSetting("password", "")
        
        # 2. Use the manager to start sing-box with the config
        success = await self.singbox_manager.start(server, port, method, password)
        
        if success:
            settings.setSetting("intended_enabled", True)
            settings.commit()
            decky_plugin.logger.info("[BACKEND] ShadowSocks started successfully")
        else:
            decky_plugin.logger.error("[BACKEND] Failed to start ShadowSocks")
        
        return success
    
    async def stop_shadowsocks(self):
        decky_plugin.logger.debug("[BACKEND] STOP SHADOWSOCKS called")
        
        success = await self.singbox_manager.stop()
        
        if success:
            settings.setSetting("intended_enabled", False)
            settings.commit()
            decky_plugin.logger.info("[BACKEND] ShadowSocks stopped successfully")
        else:
            decky_plugin.logger.warning("[BACKEND] Could not stop ShadowSocks (may not have been running)")
        
        return success
    
    async def get_enabled_state(self):
        intended_enabled = settings.getSetting("intended_enabled", False)
        decky_plugin.logger.info(f"[BACKEND] get_enabled_state called, returning intended_enabled: {intended_enabled}")
        return intended_enabled
    
    async def check_proxy_working(self) -> bool:
        decky_plugin.logger.debug("[BACKEND] Checking proxy via HTTPS (no cert verify)")
        ctx = ssl._create_unverified_context()
        try:
            urllib.request.urlopen("https://google.com", timeout=3, context=ctx)
            await asyncio.sleep(2)
            return True
        except Exception as e:
            decky_plugin.logger.warning(f"[BACKEND] Proxy check failed: {e}")
            return False

    async def monitor(self):
        decky_plugin.logger.info("[BACKEND] Starting monitor loop")
        while True:
            await asyncio.sleep(3) 
            intended_enabled = settings.getSetting("intended_enabled", False)
            is_running = self.singbox_manager.is_running()
            decky_plugin.logger.debug(f"[BACKEND] Monitor: intended_enabled={intended_enabled}, is_running={is_running}")
            
            if intended_enabled:
                if not is_running:
                    decky_plugin.logger.info("[BACKEND] Monitor: Process not running, restarting...")
                    await self.start_shadowsocks()
                else:
                    # Check if proxy is working
                    if not await self.check_proxy_working():
                        decky_plugin.logger.info("[BACKEND] Monitor: Process running but proxy NOT WORKING, restarting...")
                        await self.stop_shadowsocks()   # without changing intended_enabled
                        await asyncio.sleep(2)          # small pause
                        await self.start_shadowsocks()

    
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky_plugin.logger.info("ShadowSocks Plugin loaded!")
        
        # Initialize default settings if they don't exist
        default_settings = {
            "server": "example.com",
            "port": 8388,
            "method": "chacha20-ietf-poly1305",
            "password": "",
            "intended_enabled": False 
        }
        
        for key, value in default_settings.items():
            if settings.getSetting(key) is None:
                decky_plugin.logger.info(f"Initializing default {key}: {value}")
                settings.setSetting(key, value)
        settings.commit()
        
        # If intended_enabled=True start sing-box
        if settings.getSetting("intended_enabled", False):
            decky_plugin.logger.info("[BACKEND] Auto-starting ShadowSocks on plugin load")
            await asyncio.sleep(5)
            await self.start_shadowsocks()
        
        # Monitoring task
        self.loop.create_task(self.monitor())
    
    async def _unload(self):
        if self.singbox_manager.is_running():
            await self.singbox_manager.stop()
        decky_plugin.logger.info("ShadowSocks Plugin unloaded!")
        pass
    
    async def _uninstall(self):
        decky_plugin.logger.info("ShadowSocks Plugin uninstalled!")
        pass
    
    async def set_setting(self, key: str, value):
        decky_plugin.logger.info(f"Setting {key} to {value}")
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
    
    async def _setup_singbox_binary(self):
        """
        Extracts and sets up the sing-box binary from the downloaded archive.
        Moves the binary and LICENSE file to the bin/ root for version-independent access.
        Returns True if setup was successful or already completed, False otherwise.
        """
        import tarfile

        plugin_dir = decky_plugin.DECKY_PLUGIN_DIR
        bin_dir = os.path.join(plugin_dir, "bin")
        versioned_dir_name = SINGBOX_ARCHIVE_NAME.replace(".tar.gz", "")
        extracted_folder_path = os.path.join(bin_dir, versioned_dir_name)
        binary_source_path = os.path.join(extracted_folder_path, "sing-box")
        license_source_path = os.path.join(extracted_folder_path, "LICENSE")
        binary_target_path = os.path.join(bin_dir, "sing-box")
        license_target_path = os.path.join(bin_dir, "LICENSE")
        archive_path = os.path.join(bin_dir, SINGBOX_ARCHIVE_NAME)
        
        # 1. Check if binary is already set up (primary success condition)
        if os.path.exists(binary_target_path):
            decky_plugin.logger.info("[Setup] sing-box binary is already set up in bin/.")
            return True
        
        # 2. Check if archive exists
        if not os.path.exists(archive_path):
            decky_plugin.logger.warning(f"[Setup] Archive not found: {archive_path}")
            return False
        
        decky_plugin.logger.info(f"[Setup] Archive found. Proceeding with setup...")
        
        try:
            # 3. Extract the archive if the target folder doesn't exist
            if not os.path.exists(extracted_folder_path):
                decky_plugin.logger.info(f"[Setup] Extracting {SINGBOX_ARCHIVE_NAME}...")
                with tarfile.open(archive_path, 'r:gz') as tar:
                    tar.extractall(path=bin_dir)
                decky_plugin.logger.info(f"[Setup] Extraction completed.")
            else:
                decky_plugin.logger.info(f"[Setup] Extracted folder already exists.")
            
            # 4. Move and make the binary executable
            if os.path.exists(binary_source_path):
                shutil.move(binary_source_path, binary_target_path)
                os.chmod(binary_target_path, 0o755)  # chmod +x
                decky_plugin.logger.info(f"[Setup] Moved and made executable: {binary_target_path}")
            else:
                decky_plugin.logger.error(f"[Setup] Source binary not found at {binary_source_path}")
                return False
            
            # 5. Move LICENSE file if it exists
            if os.path.exists(license_source_path):
                shutil.move(license_source_path, license_target_path)
                decky_plugin.logger.info(f"[Setup] Moved license to: {license_target_path}")
            
            # 6. Clean up the empty versioned directory and archive
            if os.path.exists(extracted_folder_path):
                os.rmdir(extracted_folder_path)
                decky_plugin.logger.info(f"[Setup] Cleared empty directory: {extracted_folder_path}")
            
            if os.path.exists(archive_path):
                os.remove(archive_path)
                decky_plugin.logger.info(f"[Setup] Removed archive: {SINGBOX_ARCHIVE_NAME}")
                
            return True
            
        except Exception as e:
            decky_plugin.logger.error(f"[Setup] Failed during file setup: {e}")
            return False

    async def _migration(self):
        """
        Migration method called on plugin load/update.
        Coordinates the setup of plugin dependencies.
        """
        decky_plugin.logger.info("[Migration] Starting migration tasks...")
        
        # Set up the sing-box binary
        success = await self._setup_singbox_binary()
        
        if success:
            decky_plugin.logger.info("[Migration] All tasks completed successfully.")
        else:
            decky_plugin.logger.warning("[Migration] Some tasks may not have completed fully.")