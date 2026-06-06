const fs   = require("fs");
const path = require("path");
const { app } = require("electron");

const FILE = path.join(app.getPath("userData"), "history.json");
const MAX  = 100;

function load() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch { return []; }
}

function save(history) {
  try { fs.writeFileSync(FILE, JSON.stringify(history), "utf-8"); }
  catch {}
}

module.exports = { load, save, MAX };