const assert = require("node:assert/strict");
const { mkdirSync, realpathSync } = require("node:fs");
const { basename, join } = require("node:path");
const { app, shell } = require("electron");

const profile = realpathSync(process.env.OMB_MISSION_FIXTURE_PROFILE);
assert(basename(profile).startsWith("omb-mission-ui-") && new URL(process.env.ELECTRON_START_URL).hostname === "127.0.0.1");
for (const key of ["home", "appData", "userData", "sessionData", "temp", "downloads", "documents", "crashDumps"]) {
  const path = ["home", "userData", "sessionData"].includes(key) ? profile : join(profile, key);
  mkdirSync(path, { recursive: true });
  app.setPath(key, path);
}
app.setAppLogsPath(join(profile, "logs"));
app.disableHardwareAcceleration();
process.once("message", message => { if (message === "quit") app.quit(); });
shell.showItemInFolder = () => {};
app.on("browser-window-created", (_event, win) => {
  win.setSkipTaskbar(true);
  win.setOpacity(0);
  win.setIgnoreMouseEvents(true);
  win.setFocusable(false);
  win.webContents.setBackgroundThrottling(false);
  win.show = () => win.showInactive();
});
void import("../../electron/main.mjs").catch(error => { console.error(error); app.exit(1); });
