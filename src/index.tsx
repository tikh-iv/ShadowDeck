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
      console.log("[FRONTEND] loadInitialSettings: Calling getAllSettings");
      const settings = await getAllSettings();
      console.log("[FRONTEND] loadInitialSettings: Settings received:", settings);
      setServer(settings.server || "example.com");
      setPort(String(settings.port || 8388));
      setMethod(settings.method || "chacha20-ietf-poly1305");
      setPassword(settings.password || "");

      console.log("[FRONTEND] loadInitialSettings: Calling getEnabledState");
      const currentState = await getEnabledState();
      console.log("[FRONTEND] loadInitialSettings: Current enabled state:", currentState);
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

  const handleToggle = async (value: boolean) => {
    console.log(`[FRONTEND] handleToggle: Called with value=${value}, current enabled=${enabled}, toggling=${toggling}`);
    if (toggling) {
      console.log("[FRONTEND] handleToggle: Already toggling, returning");
      return;
    }
    setToggling(true);
    console.log("[FRONTEND] handleToggle: Set toggling to true");
    try {
      let success;
      if (value) {
        console.log("[FRONTEND] handleToggle: User wants to ENABLE ShadowSocks");
        success = await startShadowsocks();
      } else {
        console.log("[FRONTEND] handleToggle: User wants to DISABLE ShadowSocks");
        success = await stopShadowsocks();
      }
      console.log(`[FRONTEND] handleToggle: Backend returned success=${success}`);
      if (success) {
        setEnabled(value);
        console.log(`[FRONTEND] handleToggle: Set enabled to ${value}`);
        const message = value ? "ShadowSocks started" : "ShadowSocks stopped";
        toaster.toast({
          title: "ShadowSocks",
          body: message
        });
        console.log(`[FRONTEND] handleToggle: ${value ? 'start' : 'stop'} ShadowSocks`);
      } else {
        throw new Error(`Backend operation failed for value=${value}`);
      }
    } catch (error) {
      console.error("[FRONTEND] handleToggle: Error:", error);
      const action = value ? "start" : "stop";
      toaster.toast({
        title: "Error",
        body: `Failed to ${action} ShadowSocks`
      });
      console.log("[FRONTEND] handleToggle: Operation failed, keeping enabled as", enabled);
    } finally {
      setToggling(false);
      console.log("[FRONTEND] handleToggle: Set toggling to false");
    }
  };

  const openServerModal = () => {
    if (enabled) {
      toaster.toast({
        title: "Cannot Edit",
        body: "Stop ShadowSocks to edit server settings"
      });
      return;
    }
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
        }}
      />
    );
  };

  const openPortModal = () => {
    if (enabled) {
      toaster.toast({
        title: "Cannot Edit",
        body: "Stop ShadowSocks to edit port settings"
      });
      return;
    }
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
        }}
      />
    );
  };

  const openPasswordModal = () => {
    if (enabled) {
      toaster.toast({
        title: "Cannot Edit",
        body: "Stop ShadowSocks to edit password"
      });
      return;
    }
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
        }}
      />
    );
  };

  const handleMethodChange = async (option: DropdownOption) => {
    if (enabled) {
      toaster.toast({
        title: "Cannot Edit",
        body: "Stop ShadowSocks to change encryption method"
      });
      return;
    }
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
  console.log("[FRONTEND] Content: Toggle will show as", enabled ? "ON" : "OFF");

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
            value={enabled}
            onChange={handleToggle}
            disabled={toggling}
          />
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
          Current state: {enabled ? "ENABLED" : "DISABLED"}
          {enabled && <div style={{ color: "#ff6b6b", marginTop: "2px" }}>Stop ShadowSocks to edit settings</div>}
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div style={{ opacity: enabled ? 0.5 : 1 }}>Server Address: {server}</div>
        <ButtonItem layout="below" onClick={openServerModal} disabled={enabled}>
          Edit Server
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <div style={{ opacity: enabled ? 0.5 : 1 }}>Port: {port}</div>
        <ButtonItem layout="below" onClick={openPortModal} disabled={enabled}>
          Edit Port
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <div style={{ opacity: enabled ? 0.5 : 1 }}>Encryption Method</div>
        <DropdownItem
          menuLabel="Select encryption method"
          rgOptions={METHOD_OPTIONS}
          selectedOption={method}
          onChange={handleMethodChange}
          disabled={enabled}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <div style={{ opacity: enabled ? 0.5 : 1 }}>Password: {password ? '********' : '(not set)'}</div>
        <ButtonItem layout="below" onClick={openPasswordModal} disabled={enabled}>
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