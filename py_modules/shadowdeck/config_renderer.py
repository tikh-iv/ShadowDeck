import os
import json
from string import Template
import decky_plugin

class ConfigRenderer:
    def __init__(self):
        self.plugin_dir = decky_plugin.DECKY_PLUGIN_DIR
    
    def render(self, server: str, port: int, method: str, password: str) -> str:
        """
        Renders the sing-box configuration JSON by substituting placeholders
        in the template with user-provided values.
        """
        template_path = os.path.join(self.plugin_dir, "config_template.json")
        
        try:
            with open(template_path, 'r') as f:
                template_content = f.read()
        except FileNotFoundError:
            decky_plugin.logger.error(f"[ConfigRenderer] Template file not found at {template_path}")
            return None
        
        # Use Python's string.Template for safe substitution
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
        
        # Optional: Validate that the rendered string is valid JSON
        try:
            json.loads(rendered)
        except json.JSONDecodeError as e:
            decky_plugin.logger.error(f"[ConfigRenderer] Rendered config is not valid JSON: {e}")
            return None
        
        return rendered
    
    def save(self, config_json: str, output_path: str) -> bool:
        """
        Saves the rendered JSON configuration to a file.
        """
        try:
            with open(output_path, 'w') as f:
                f.write(config_json)
            decky_plugin.logger.info(f"[ConfigRenderer] Config saved to: {output_path}")
            return True
        except Exception as e:
            decky_plugin.logger.error(f"[ConfigRenderer] Failed to save config to {output_path}: {e}")
            return False