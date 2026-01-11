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
  Toggle,
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

// Callable functions
const setSetting = callable<[key: string, value: any], boolean>("set_setting");
const getAllSettings = callable<[], {
  server: string,
  port: number,
  method: string,
  password: string
}>("get_all_settings");

const getEnabledState = callable<[], boolean>("get_enabled_state");
const startShadowsocks = callable<[], boolean>("start_shadowsocks");
const stopShadowsocks = callable<[], boolean>("stop_shadowsocks");

// Modal components
function EditServerModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);
  
  const handleSave = () => {
    console.log("[FRONTEND] EditServerModal: Saving value:", value);
    onSave(value);
    closeModal();
  };
  
  return (
    <Focusable style={{ padding: "20px", backgroundColor: "#1a1a1a", borderRadius: "5px" }}>
      <div style={{ marginBottom: "10px" }}>Edit Server Address</div>
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter server address"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <DialogButton onClick={handleSave}>
          Save
        </DialogButton>
        <DialogButton onClick={closeModal}>
          Cancel
        </DialogButton>
      </div>
    </Focusable>
  );
}

function EditPortModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);
  
  const handleSave = () => {
    console.log("[FRONTEND] EditPortModal: Saving value:", value);
    onSave(value);
    closeModal();
  };
  
  return (
    <Focusable style={{ padding: "20px", backgroundColor: "#1a1a1a", borderRadius: "5px" }}>
      <div style={{ marginBottom: "10px" }}>Edit Port</div>
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter port number"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <DialogButton onClick={handleSave}>
          Save
        </DialogButton>
        <DialogButton onClick={closeModal}>
          Cancel
        </DialogButton>
      </div>
    </Focusable>
  );
}

function EditPasswordModal({ closeModal, initialValue, onSave }: { closeModal: () => void; initialValue: string; onSave: (newValue: string) => void }) {
  const [value, setValue] = useState(initialValue);
  
  const handleSave = () => {
    console.log("[FRONTEND] EditPasswordModal: Saving password");
    onSave(value);
    closeModal();
  };
  
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
        <DialogButton onClick={handleSave}>
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
  const METHOD_OPTIONS: DropdownOption[] = [
    { label: "chacha20-ietf-poly1305", data: "chacha20-ietf-poly1305" },
    { label: "aes-256-gcm", data: "aes-256-gcm" },
    { label: "aes-128-gcm", data: "aes-128-gcm" },
    { label: "aes-256-cfb", data: "aes-256-cfb" },
    { label: "aes-128-cfb", data: "aes-128-cfb" },
    { label: "rc4-md5", data: "rc4-md5" },
    { label: "xchacha20-ietf-poly1305", data: "xchacha20-ietf-poly1305" },
  ];

  const [server, setServer] = useState<string>("example.com");
  const [port, setPort] = useState<string>("8388");
  const [method, setMethod] = useState<string>("chacha20-ietf-poly1305");
  const [password, setPassword] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  useEffect(() => {
    console.log("[FRONTEND] useEffect: Component mounted");
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    console.log("[FRONTEND] loadInitialSettings: Starting");
    setLoading(true);
    try {
      // Load only configuration settings
      console.log("[FRONTEND] loadInitialSettings: Calling getAllSettings");
      const settings = await getAllSettings();
      console.log("[FRONTEND] loadInitialSettings: Settings received:", settings);
      
      setServer(settings.server || "example.com");
      setPort(String(settings.port || 8388));
      setMethod(settings.method || "chacha20-ietf-poly1305");
      setPassword(settings.password || "");
      
      // Get current state
      console.log("[FRONTEND] loadInitialSettings: Calling getEnabledState");
      const currentState = await getEnabledState();
      console.log("[FRONTEND] loadInitialSettings: Current enabled state:", currentState);
      
      // Important: Decky Toggle works opposite of what you might expect
      // If ShadowSocks is enabled, we want the toggle to show as "on" (slider to right)
      // But in Decky, when toggle is "on", checked={false}
      // So we need to invert the logic here
      setEnabled(currentState || false);
      
      console.log("[FRONTEND] loadInitialSettings: Toggle state set to:", currentState || false);
    } catch (error) {
      console.error("[FRONTEND] loadInitialSettings: Failed to load settings:", error);
      toaster.toast({ title: "Error", body: "Failed to load settings" });
    } finally {
      setLoading(false);
      console.log("[FRONTEND] loadInitialSettings: Finished");
    }
  };

  const handleToggle = async (checked: boolean) => {
    console.log(`[FRONTEND] handleToggle: Called with checked=${checked}, current enabled=${enabled}, toggling=${toggling}`);
    
    if (toggling) {
      console.log("[FRONTEND] handleToggle: Already toggling, returning");
      return;
    }
    
    setToggling(true);
    console.log("[FRONTEND] handleToggle: Set toggling to true");
    
    try {
      let success;
      
      // Important: Decky Toggle sends the NEW state, not the opposite!
      // If toggle shows OFF (checked=false) and user clicks it, 
      // they want to turn it ON, so checked will be true
      if (checked) {
        console.log("[FRONTEND] handleToggle: User wants to ENABLE ShadowSocks");
        success = await startShadowsocks();
      } else {
        console.log("[FRONTEND] handleToggle: User wants to DISABLE ShadowSocks");
        success = await stopShadowsocks();
      }

      console.log(`[FRONTEND] handleToggle: Backend returned success=${success}`);
      
      if (success) {
        setEnabled(checked);
        console.log(`[FRONTEND] handleToggle: Set enabled to ${checked}`);
        
        const action = checked ? "start" : "stop";
        const message = checked ? "ShadowSocks started" : "ShadowSocks stopped";
        
        toaster.toast({ 
          title: "ShadowSocks", 
          body: message 
        });
        
        console.log(`[FRONTEND] handleToggle: ${action} ShadowSocks`);
      } else {
        throw new Error(`Backend operation failed for checked=${checked}`);
      }
    } catch (error) {
      console.error("[FRONTEND] handleToggle: Error:", error);
      
      const action = checked ? "start" : "stop";
      toaster.toast({ 
        title: "Error", 
        body: `Failed to ${action} ShadowSocks` 
      });
      
      // Don't change state since operation failed
      console.log("[FRONTEND] handleToggle: Operation failed, keeping enabled as", enabled);
    } finally {
      setToggling(false);
      console.log("[FRONTEND] handleToggle: Set toggling to false");
    }
  };

  const openServerModal = () => {
    console.log("[FRONTEND] openServerModal: Opening modal");
    showModal(
      <EditServerModal
        initialValue={server}
        onSave={async (newValue: string) => {
          console.log("[FRONTEND] openServerModal: onSave called with:", newValue);
          setServer(newValue);
          try {
            await setSetting("server", newValue);
            console.log("[FRONTEND] openServerModal: Server saved successfully:", newValue);
            toaster.toast({ title: "Success", body: "Server address updated" });
          } catch (error) {
            console.error("[FRONTEND] openServerModal: Failed to save server:", error);
            toaster.toast({ title: "Error", body: "Failed to save server" });
          }
        }}
        closeModal={() => {
          console.log("[FRONTEND] openServerModal: Modal closed");
          // Modal closes automatically when user clicks Save or Cancel
        }}
      />
    );
  };

  const openPortModal = () => {
    console.log("[FRONTEND] openPortModal: Opening modal");
    showModal(
      <EditPortModal
        initialValue={port}
        onSave={async (newValue: string) => {
          console.log("[FRONTEND] openPortModal: onSave called with:", newValue);
          const portNum = parseInt(newValue, 10);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            console.log("[FRONTEND] openPortModal: Invalid port number:", newValue);
            toaster.toast({ title: "Error", body: "Port must be between 1 and 65535" });
            return;
          }
          setPort(newValue);
          try {
            await setSetting("port", portNum);
            console.log("[FRONTEND] openPortModal: Port saved successfully:", portNum);
            toaster.toast({ title: "Success", body: "Port updated" });
          } catch (error) {
            console.error("[FRONTEND] openPortModal: Failed to save port:", error);
            toaster.toast({ title: "Error", body: "Failed to save port" });
          }
        }}
        closeModal={() => {
          console.log("[FRONTEND] openPortModal: Modal closed");
          // Modal closes automatically when user clicks Save or Cancel
        }}
      />
    );
  };

  const openPasswordModal = () => {
    console.log("[FRONTEND] openPasswordModal: Opening modal");
    showModal(
      <EditPasswordModal
        initialValue={password}
        onSave={async (newValue: string) => {
          console.log("[FRONTEND] openPasswordModal: onSave called");
          setPassword(newValue);
          try {
            await setSetting("password", newValue);
            console.log("[FRONTEND] openPasswordModal: Password saved successfully");
            toaster.toast({ title: "Success", body: "Password updated" });
          } catch (error) {
            console.error("[FRONTEND] openPasswordModal: Failed to save password:", error);
            toaster.toast({ title: "Error", body: "Failed to save password" });
          }
        }}
        closeModal={() => {
          console.log("[FRONTEND] openPasswordModal: Modal closed");
          // Modal closes automatically when user clicks Save or Cancel
        }}
      />
    );
  };

  const handleMethodChange = async (option: DropdownOption) => {
    const newMethod = String(option.data);
    console.log("[FRONTEND] handleMethodChange: Changing method to:", newMethod);
    setMethod(newMethod);
    try {
      await setSetting("method", newMethod);
      console.log("[FRONTEND] handleMethodChange: Method saved successfully");
      toaster.toast({ title: "Success", body: "Encryption method updated" });
    } catch (error) {
      console.error("[FRONTEND] handleMethodChange: Failed to save method:", error);
      toaster.toast({ title: "Error", body: "Failed to save method" });
    }
  };

  if (loading) {
    console.log("[FRONTEND] Content: Rendering loading state");
    return (
      <PanelSection>
        <PanelSectionRow>
          <div>Loading ShadowSocks settings...</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  console.log("[FRONTEND] Content: Rendering main content");
  console.log("[FRONTEND] Content: enabled state =", enabled);
  console.log("[FRONTEND] Content: Toggle will show as", enabled ? "ON (slider right)" : "OFF (slider left)");
  
  return (
    <PanelSection title="ShadowSocks Configuration">
      <PanelSectionRow>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          width: "100%" 
        }}>
          <span>Enable ShadowSocks</span>
          <Toggle
            checked={enabled}
            onChange={handleToggle}
            disabled={toggling}
          />
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
          Current state: {enabled ? "ENABLED" : "DISABLED"}
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>Server Address: {server}</div>
        <ButtonItem layout="below" onClick={openServerModal}>
          Edit Server
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>Port: {port}</div>
        <ButtonItem layout="below" onClick={openPortModal}>
          Edit Port
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>Encryption Method</div>
        <DropdownItem
          menuLabel="Select encryption method"
          rgOptions={METHOD_OPTIONS}
          selectedOption={method}
          onChange={handleMethodChange}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <div>Password: {password ? '********' : '(not set)'}</div>
        <ButtonItem layout="below" onClick={openPasswordModal}>
          Edit Password
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  console.log("[FRONTEND] Plugin: ShadowSocks Plugin initializing...");
  const listener = addEventListener<[string, boolean, number]>(
    "timer_event",
    (test1, test2, test3) => {
      console.log("[FRONTEND] Plugin: Timer event received:", test1, test2, test3);
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
      console.log("[FRONTEND] Plugin: ShadowSocks Plugin unloading");
      removeEventListener("timer_event", listener);
    },
  };
});