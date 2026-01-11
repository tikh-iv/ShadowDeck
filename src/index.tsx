import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  DropdownItem,
  TextField,
  staticClasses,
  DropdownOption,
  showModal,
  Focusable,
  DialogButton,
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

// Modal component for editing server
function EditServerModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);

  return (
    <Focusable style={{ padding: "20px", backgroundColor: "#1a1a1a", borderRadius: "5px" }}>
      <div style={{ marginBottom: "10px" }}>Edit Server Address</div>
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter server address"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <DialogButton onClick={() => { onSave(value); closeModal(); }}>
          Save
        </DialogButton>
        <DialogButton onClick={closeModal}>
          Cancel
        </DialogButton>
      </div>
    </Focusable>
  );
}

// Modal component for editing port
function EditPortModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);

  return (
    <Focusable style={{ padding: "20px", backgroundColor: "#1a1a1a", borderRadius: "5px" }}>
      <div style={{ marginBottom: "10px" }}>Edit Port</div>
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter port number"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <DialogButton onClick={() => { onSave(value); closeModal(); }}>
          Save
        </DialogButton>
        <DialogButton onClick={closeModal}>
          Cancel
        </DialogButton>
      </div>
    </Focusable>
  );
}

// Modal component for editing password
function EditPasswordModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);

  return (
    <Focusable style={{ padding: "20px", backgroundColor: "#1a1a1a", borderRadius: "5px" }}>
      <div style={{ marginBottom: "10px" }}>Edit Password</div>
      <TextField
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter password"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <DialogButton onClick={() => { onSave(value); closeModal(); }}>
          Save
        </DialogButton>
        <DialogButton onClick={closeModal}>
          Cancel
        </DialogButton>
      </div>
    </Focusable>
  );
}

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
  const [port, setPort] = useState<string>(globalPort.toString());
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
      setPort(globalPort.toString());
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
      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        toaster.toast({ title: "Error", body: "Port must be between 1 and 65535" });
        return;
      }
      // Update global variables
      globalServer = server;
      globalPort = portNum;
      globalMethod = method;
      globalPassword = password;
      // Save all settings
      await setSetting("server", server);
      await setSetting("port", portNum);
      await setSetting("method", method);
      await setSetting("password", password);
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toaster.toast({ title: "Error", body: "Failed to save settings" });
    }
  };

  // Use the same pattern that worked with numbers
  const handleMethodChange = (option: DropdownOption) => {
    const newMethod = String(option.data);
    console.log("Method change: updating to", newMethod);
    // Update global variable
    globalMethod = newMethod;
    // Update state for UI
    setMethod(newMethod);
    // Save immediately
    setSetting("method", newMethod);
    console.log("Method saved:", newMethod);
  };

  const openServerModal = () => {
    let close: () => void;
    const modal = showModal(
      <EditServerModal
        initialValue={server}
        onSave={async (newValue: string) => {
          setServer(newValue);
          globalServer = newValue;
          try {
            await setSetting("server", newValue);
            console.log("Server saved:", newValue);
          } catch (error) {
            console.error("Failed to save server:", error);
            toaster.toast({ title: "Error", body: "Failed to save server" });
          }
        }}
        closeModal={() => close()}
      />,
      false,
      true
    );
    close = modal.closeModal;
  };

  const openPortModal = () => {
    let close: () => void;
    const modal = showModal(
      <EditPortModal
        initialValue={port}
        onSave={async (newValue: string) => {
          const portNum = parseInt(newValue, 10);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            toaster.toast({ title: "Error", body: "Port must be between 1 and 65535" });
            return;
          }
          setPort(newValue);
          globalPort = portNum;
          try {
            await setSetting("port", portNum);
            console.log("Port saved:", portNum);
          } catch (error) {
            console.error("Failed to save port:", error);
            toaster.toast({ title: "Error", body: "Failed to save port" });
          }
        }}
        closeModal={() => close()}
      />,
      false,
      true
    );
    close = modal.closeModal;
  };

  const openPasswordModal = () => {
    let close: () => void;
    const modal = showModal(
      <EditPasswordModal
        initialValue={password}
        onSave={async (newValue: string) => {
          setPassword(newValue);
          globalPassword = newValue;
          try {
            await setSetting("password", newValue);
            console.log("Password saved:", newValue);
          } catch (error) {
            console.error("Failed to save password:", error);
            toaster.toast({ title: "Error", body: "Failed to save password" });
          }
        }}
        closeModal={() => close()}
      />,
      false,
      true
    );
    close = modal.closeModal;
  };

  return (
    <PanelSection title="ShadowSocks Configuration">
      {/* Server Field - With modal */}
      <PanelSectionRow>
        <div>Server Address: {server}</div>
        <ButtonItem layout="below" onClick={openServerModal}>
          Edit Server
        </ButtonItem>
      </PanelSectionRow>
      {/* Port Field - With modal */}
      <PanelSectionRow>
        <div>Port: {port}</div>
        <ButtonItem layout="below" onClick={openPortModal}>
          Edit Port
        </ButtonItem>
      </PanelSectionRow>
      {/* Method Field */}
      <PanelSectionRow>
        <div>Encryption Method</div>
        <DropdownItem
          menuLabel="Select encryption method"
          rgOptions={METHOD_OPTIONS}
          selectedOption={method}
          onChange={handleMethodChange}
        />
      </PanelSectionRow>
      {/* Password Field - With modal */}
      <PanelSectionRow>
        <div>Password: {password ? '********' : ''}</div>
        <ButtonItem layout="below" onClick={openPasswordModal}>
          Edit Password
        </ButtonItem>
      </PanelSectionRow>
      {/* Save Button - Optional now, but kept for bulk save if needed */}
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSaveSettings}>
          {saveStatus || "Save All Settings"}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  console.log("ShadowSocks Plugin initializing...");
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