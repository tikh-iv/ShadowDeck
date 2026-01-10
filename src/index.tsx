import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  DropdownItem,
  TextField,
  staticClasses,
  DropdownOption,
  Field,
} from "@decky/ui";
import {
  addEventListener,
  removeEventListener,
  callable,
  definePlugin,
  toaster,
} from "@decky/api";
import { useState, useEffect } from "react";
import { FaShip } from "react-icons/fa";

// Define callable functions for settings management
const setSetting = callable<[key: string, value: any], boolean>("set_setting");
const getAllSettings = callable<[], { 
  server: string, 
  port: number, 
  method: string, 
  password: string 
}>("get_all_settings");

// Global variables to persist state between component re-mounts
let globalServer = "example.com";
let globalPort = 8388;
let globalMethod = "chacha20-ietf-poly1305";
let globalPassword = "";
let settingsLoaded = false;

function Content() {
  // Encryption method options
  const METHOD_OPTIONS: DropdownOption[] = [
    { label: "chacha20-ietf-poly1305", data: "chacha20-ietf-poly1305" },
    { label: "aes-256-gcm", data: "aes-256-gcm" },
    { label: "aes-128-gcm", data: "aes-128-gcm" },
    { label: "aes-256-cfb", data: "aes-256-cfb" },
    { label: "aes-128-cfb", data: "aes-128-cfb" },
    { label: "rc4-md5", data: "rc4-md5" },
    { label: "xchacha20-ietf-poly1305", data: "xchacha20-ietf-poly1305" },
  ];

  // State for UI
  const [server, setServer] = useState<string>(globalServer);
  const [port, setPort] = useState<number>(globalPort);
  const [method, setMethod] = useState<string>(globalMethod);
  const [password, setPassword] = useState<string>(globalPassword);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Load settings only once on initial mount
  useEffect(() => {
    if (!settingsLoaded) {
      loadInitialSettings();
    }
  }, []);

  const loadInitialSettings = async () => {
    try {
      const settings = await getAllSettings();
      
      // Update global variables
      globalServer = settings.server || "example.com";
      globalPort = settings.port || 8388;
      globalMethod = settings.method || "chacha20-ietf-poly1305";
      globalPassword = settings.password || "";
      
      // Update state for UI
      setServer(globalServer);
      setPort(globalPort);
      setMethod(globalMethod);
      setPassword(globalPassword);
      
      settingsLoaded = true;
    } catch (error) {
      console.error("Failed to load settings:", error);
      toaster.toast({ title: "Error", body: "Failed to load settings" });
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Update global variables
      globalServer = server;
      globalPort = port;
      globalMethod = method;
      globalPassword = password;
      
      // Save all settings
      await setSetting("server", server);
      await setSetting("port", port);
      await setSetting("method", method);
      await setSetting("password", password);
      
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toaster.toast({ title: "Error", body: "Failed to save settings" });
    }
  };

  const handleServerChange = (value: string) => {
    setServer(value);
  };

  const handlePortChange = (value: string) => {
    const portNum = parseInt(value, 10);
    if (!isNaN(portNum) && portNum >= 1 && portNum <= 65535) {
      setPort(portNum);
    }
  };

  const handleMethodChange = (option: DropdownOption) => {
    const newMethod = String(option.data);
    setMethod(newMethod);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  return (
    <PanelSection title="ShadowSocks Configuration">
      {/* Server Field */}
      <Field
        label="Server Address"
        description={<span>Current: {server}</span>}
      >
        <TextField
          value={server}
          onChange={(e) => handleServerChange(e.target.value)}
        />
      </Field>

      {/* Port Field */}
      <Field
        label="Port"
        description={<span>Current: {port}</span>}
      >
        <TextField
          value={port.toString()}
          onChange={(e) => handlePortChange(e.target.value)}
        />
      </Field>

      {/* Method Field */}
      <Field
        label="Encryption Method"
        description={<span>Current: {method}</span>}
      >
        <DropdownItem
          menuLabel="Select encryption method"
          rgOptions={METHOD_OPTIONS}
          selectedOption={method}
          onChange={handleMethodChange}
        />
      </Field>

      {/* Password Field */}
      <Field
        label="Password"
        description={<span>Password is set</span>}
      >
        <TextField
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
      </Field>

      {/* Save Button */}
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSaveSettings}>
          {saveStatus || "Save Settings"}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  console.log("ShadowSocks Plugin initializing...");

  // Event listener example (kept from original template)
  const listener = addEventListener<[string, boolean, number]>(
    "timer_event",
    (test1, test2, test3) => {
      console.log("Timer event received:", test1, test2, test3);
      toaster.toast({
        title: "Timer Event",
        body: `${test1}, ${test2}, ${test3}`
      });
    }
  );

  return {
    name: "ShadowSocks",
    titleView: <div className={staticClasses.Title}>ShadowSocks</div>,
    content: <Content />,
    icon: <FaShip />,
    onDismount() {
      console.log("ShadowSocks Plugin unloading");
      removeEventListener("timer_event", listener);
    },
  };
});