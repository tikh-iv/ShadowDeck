import os
import json
from string import Template
import decky_plugin

class ConfigRenderer:
    def __init__(self):
        self.plugin_dir = decky_plugin.DECKY_PLUGIN_DIR
        
        if hasattr(decky_plugin, 'DECKY_PLUGIN_RUNTIME_DIR'):
            self.data_dir = decky_plugin.DECKY_PLUGIN_RUNTIME_DIR
            decky_plugin.logger.info(f"[ConfigRenderer] DECKY_PLUGIN_RUNTIME_DIR is {decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}")
        else:
            import tempfile
            self.data_dir = tempfile.mkdtemp(prefix="shadowdeck_")
            decky_plugin.logger.info(f"[ConfigRenderer] DECKY_PLUGIN_RUNTIME_DIR is NOT DEFINED")

    
    def render(self, server: str, port: int, method: str, password: str) -> str:
        template_path = os.path.join(self.plugin_dir, "config_template.json")
        
        try:
            with open(template_path, 'r') as f:
                template_content = f.read()
        except FileNotFoundError:
            decky_plugin.logger.error(f"[ConfigRenderer] Template file not found at {template_path}")
            return None
        
        template = Template(template_content)
        try:
            rendered = template.safe_substitute(
                server=server,
                port=port,
                method=method,
                password=password
            )
        except Exception as e:
            decky_plugin.logger.error(f"[ConfigRenderer] Failed to substitute template values: {e}")
            return None
        
        try:
            json.loads(rendered)
        except json.JSONDecodeError as e:
            decky_plugin.logger.error(f"[ConfigRenderer] Rendered config is not valid JSON: {e}")
            return None
        
        return rendered
    
    def save(self, config_json: str) -> str:
        """
        Saves the rendered JSON configuration to a file.
        Returns the path to the saved config file or None on failure.
        """
        os.makedirs(self.data_dir, exist_ok=True)
        config_path = os.path.join(self.data_dir, "singbox_config.json")
        
        try:
            with open(config_path, 'w') as f:
                f.write(config_json)
            decky_plugin.logger.info(f"[ConfigRenderer] Config saved to: {config_path}")
            return config_path
        except Exception as e:
            decky_plugin.logger.error(f"[ConfigRenderer] Failed to save config to {config_path}: {e}")
            return None

    def get_config_path(self) -> str:
        """Returns the path where config is expected to be."""
        return os.path.join(self.data_dir, "singbox_config.json")