const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getHistory : ()      => ipcRenderer.invoke("get-history"),
  copyItem   : (id)    => ipcRenderer.invoke("copy-item", id),
  deleteItem : (id)    => ipcRenderer.invoke("delete-item", id),
  clearAll   : ()      => ipcRenderer.invoke("clear-all"),
  hide       : ()      => ipcRenderer.invoke("hide"),
  onRefresh  : (cb)    => ipcRenderer.on("refresh", cb),
});