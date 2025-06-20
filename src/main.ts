import path from "node:path";
import { app, clipboard, Menu, nativeImage, nativeTheme, Tray } from "electron";

let tray: Tray | null = null;
let clipboardHistory: string[] = [];
let lastText: string = "";

function updateClipboardHistory() {
  const currentText = clipboard.readText();
  if (currentText && currentText !== lastText) {
    lastText = currentText;
    clipboardHistory.unshift(currentText);
    clipboardHistory = [...new Set(clipboardHistory)].slice(0, 10);
    buildMenu();
  }
}

function buildMenu() {
  if (!tray) return;
  const menuItems = clipboardHistory.map((text) => ({
    label: text.length > 40 ? `${text.slice(0, 37)}...` : text,
    click: () => clipboard.writeText(text),
  }));

  tray.setContextMenu(
    Menu.buildFromTemplate([
      ...menuItems,
      { type: "separator" },
      { label: "Quit", role: "quit", accelerator: "CmdOrCtrl+Q" },
    ]),
  );
}

function getTrayIcon() {
  const isDark = nativeTheme.shouldUseDarkColors;

  const iconFile =
    process.platform === "win32"
      ? isDark
        ? "tray-icon-light.png"
        : "tray-icon-dark.png"
      : "tray-icon-dark.png";

  const iconPath = path.join(__dirname, "../assets", iconFile);
  const size = process.platform === "win32" ? 24 : 16;

  const icon = nativeImage.createFromPath(iconPath).resize({
    width: size,
    height: size,
  });

  if (process.platform === "darwin") {
    icon.setTemplateImage(true);
  }

  return icon;
}

app.whenReady().then(() => {
  tray = new Tray(getTrayIcon());
  tray.setToolTip("Clipboard History");

  setInterval(updateClipboardHistory, 500);

  if (process.platform === "win32") {
    nativeTheme.on("updated", () => {
      tray?.setImage(getTrayIcon());
    });
  }
});
