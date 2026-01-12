import os
import subprocess
import asyncio
import decky_plugin
from .config_renderer import ConfigRenderer

class SingBoxManager:
    def __init__(self):
        self.process = None
        self.plugin_dir = decky_plugin.DECKY_PLUGIN_DIR
        self.config_renderer = ConfigRenderer()
        self.binary_path = os.path.join(self.plugin_dir, "bin", "sing-box")
        self.config_path = None
    
    async def start(self, server: str, port: int, method: str, password: str) -> bool:
        if self.process is not None:
            decky_plugin.logger.warning("[SingBox] Process already running.")
            return False
        
        rendered_config = self.config_renderer.render(server, port, method, password)
        if rendered_config is None:
            return False
        
        self.config_path = self.config_renderer.save(rendered_config)
        if not self.config_path:
            return False
        
        if not os.path.exists(self.binary_path):
            decky_plugin.logger.error(f"[SingBox] Binary not found: {self.binary_path}")
            return False
        
        try:
            self.process = subprocess.Popen(
                [self.binary_path, "run", "-c", self.config_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            decky_plugin.logger.info(f"[SingBox] Started with PID: {self.process.pid}")
            return True
        except Exception as e:
            decky_plugin.logger.error(f"[SingBox] Failed to start process: {e}")
            self.process = None
            return False
    
    async def stop(self) -> bool:
        if self.process is not None:
            try:
                self.process.terminate()
                self.process.wait(timeout=5)
                decky_plugin.logger.info("[SingBox] Stopped successfully")
            except subprocess.TimeoutExpired:
                self.process.kill()
                decky_plugin.logger.warning("[SingBox] Force killed after timeout")
            except Exception as e:
                decky_plugin.logger.error(f"[SingBox] Error stopping process: {e}")
            finally:
                self.process = None
                return True
        return False
    
    def is_running(self) -> bool:
        if self.process is None:
            return False
        return self.process.poll() is None