# ShadowDeck — Shadowsocks for Steam Deck (Decky Plugin)

ShadowDeck is a **Decky Loader plugin** that allows you to run a **Shadowsocks proxy** on your Steam Deck using **sing-box** as the backend.
It is designed to provide a simple UI for connecting your Deck to a Shadowsocks server directly from Game Mode or Desktop Mode.

This plugin is intended for:

* bypassing network restrictions
* improving connectivity in restricted networks
* private and encrypted proxy access

---

## ✨ Features

* One-click Shadowsocks connect / disconnect
* Runs completely on-device
* Uses **sing-box** (modern, fast, actively maintained)
* Stores your settings securely in Decky
* Works in **Game Mode** and **Desktop Mode**

---

## ⚠️ Steam & VPN Disclaimer
Using a VPN or proxy with Steam may violate Valve’s Terms of Service.
By using ShadowDeck you accept full responsibility for how you use it.
The developers do not encourage or endorse ToS violations.
If Steam takes action on your account due to VPN or proxy usage, that is between you and Valve — it is what it is.

---

## 🔧 How it works

ShadowDeck is a frontend for **sing-box**, an open-source universal proxy platform that supports **Shadowsocks** and many other protocols.

When the plugin is installed:

1. ShadowDeck automatically downloads the official **sing-box** binary
2. It extracts the binary into the plugin’s `bin/` folder
3. The included **sing-box LICENSE** file is stored next to the binary
4. Your Shadowsocks connection is started using sing-box in the background

No system packages or root access are required.

---

## 📥 What gets downloaded

This plugin automatically downloads the following file from the official sing-box project:

```
sing-box-1.12.15-linux-amd64.tar.gz
```

This archive contains:

* `sing-box` (the executable binary)
* `LICENSE` (sing-box license)

The plugin extracts them into:

```
<plugin>/bin/sing-box
<plugin>/bin/LICENSE
```

These files are **not modified**.

---

## 📜 sing-box License

sing-box is developed by **Sagernet** and is licensed under the **GNU General Public License v3 (GPL-3.0)**.

Project homepage:
[https://sing-box.sagernet.org/](https://sing-box.sagernet.org/)

Source code:
[https://github.com/SagerNet/sing-box](https://github.com/SagerNet/sing-box)

License text:
[https://github.com/SagerNet/sing-box/blob/main/LICENSE](https://github.com/SagerNet/sing-box/blob/main/LICENSE)

Because this plugin redistributes the sing-box binary, its license is included in:

```
bin/LICENSE
```

ShadowDeck itself is a separate project and is not affiliated with the sing-box developers.

---

## 🚀 Installation

Install ShadowDeck from the **Decky Plugin Store** (recommended),
or manually using a `.zip` package via Decky Loader.

After installation, open:

```
Decky → ShadowDeck
```

---

## ⚙️ Configuration

In the plugin UI you must provide your **Shadowsocks server details**:

| Field    | Description                                       |
| -------- | ------------------------------------------------- |
| Server   | Your Shadowsocks server hostname or IP            |
| Port     | Server port (e.g. `8388`)                         |
| Method   | Encryption method (e.g. `chacha20-ietf-poly1305`) |
| Password | Your Shadowsocks password                         |

These values are provided by your Shadowsocks provider.

---

## ▶️ How to connect

1. Open Decky
2. Open **ShadowDeck**
3. Enter your server details
4. Press **Enable**

When enabled:

* sing-box starts in the background
* your system traffic is routed through the Shadowsocks proxy

To disconnect, simply press **Disable**.

---

## 🔍 Troubleshooting

If the connection does not work:

* Make sure your server, port, method and password are correct
* Check that your server supports **Shadowsocks**
* Restart Decky Loader and try again

Logs can be found in:

```
Decky → Settings → Developer → View Logs
```

Look for entries containing `ShadowDeck` or `sing-box`.

---

## 🔐 Security Notice

Your Shadowsocks credentials are stored locally on your Steam Deck using Decky’s settings system.
They are **not sent anywhere** except to your configured server.

ShadowDeck does not collect telemetry.

---

## 🧾 License

ShadowDeck (this plugin) is distributed under the license included in this repository.

sing-box is a third-party project licensed under **GPL-3.0**.
Its license is included in `bin/LICENSE` as required.

