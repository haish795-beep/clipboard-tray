const {
  app, BrowserWindow, Tray, Menu,
  globalShortcut, clipboard, ipcMain, nativeImage,
} = require("electron");
const path  = require("path");
const store = require("./store");

let win     = null;
let tray    = null;
let history = store.load();
let lastText  = "";
let lastImage = "";

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 560,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.on("blur", () => win.hide());
}

function toggleWindow() {
  if (!win) return;
  if (win.isVisible()) {
    win.hide();
  } else {
    const { screen } = require("electron");
    const cursor  = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor);
    const { width: sw, height: sh, x: sx, y: sy } = display.workArea;
    const [ww, wh] = win.getSize();
    win.setPosition(
      Math.min(cursor.x, sx + sw - ww - 8),
      Math.min(cursor.y, sy + sh - wh - 8)
    );
    win.show();
    win.focus();
    win.webContents.send("refresh");
  }
}

function watchClipboard() {
  setInterval(() => {
    const img = clipboard.readImage();
    if (!img.isEmpty()) {
      const dataUrl = img.toDataURL();
      if (dataUrl !== lastImage) {
        lastImage = dataUrl;
        lastText  = "";
        addItem({ type: "image", data: dataUrl, time: Date.now() });
      }
      return;
    }

    const text = clipboard.readText();
    if (text && text !== lastText) {
      lastText  = text;
      lastImage = "";
      addItem({ type: "text", data: text, time: Date.now() });
    }
  }, 500);
}

function addItem(item) {
  item.id = `${item.time}-${Math.random().toString(36).slice(2, 6)}`;
  history = history.filter((h) => h.data !== item.data);
  history.unshift(item);
  if (history.length > store.MAX) history = history.slice(0, store.MAX);
  store.save(history);
  if (win?.isVisible()) win.webContents.send("refresh");
}

ipcMain.handle("get-history", () => {
  return history.map((h) =>
    h.type === "image"
      ? { ...h, data: h.data }
      : { ...h, preview: h.data.slice(0, 200) }
  );
});

ipcMain.handle("copy-item", (_, id) => {
  const item = history.find((h) => h.id === id);
  if (!item) return;
  if (item.type === "text") {
    lastText = item.data;
    clipboard.writeText(item.data);
  } else {
    lastImage = item.data;
    clipboard.writeImage(nativeImage.createFromDataURL(item.data));
  }
  history = [item, ...history.filter((h) => h.id !== id)];
  store.save(history);
  win.hide();
});

ipcMain.handle("delete-item", (_, id) => {
  history = history.filter((h) => h.id !== id);
  store.save(history);
});

ipcMain.handle("clear-all", () => {
  history = [];
  store.save(history);
});

ipcMain.handle("hide", () => win?.hide());

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("클립보드 히스토리");
  tray.on("click", toggleWindow);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "열기",     click: toggleWindow },
      { label: "전체 삭제", click: () => { history = []; store.save(history); } },
      { type: "separator" },
      { label: "종료",     click: () => app.quit() },
    ])
  );
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  watchClipboard();

  globalShortcut.register("CommandOrControl+Shift+V", toggleWindow);
});

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", (e) => e.preventDefault());