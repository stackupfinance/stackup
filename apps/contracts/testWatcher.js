/* eslint-disable @typescript-eslint/no-var-requires */
const chokidar = require("chokidar");
const path = require("path");
const { spawn } = require("child_process");
const { name } = require("./package.json");

chokidar
  .watch([
    path.resolve(__dirname, "./contracts"),
    path.resolve(__dirname, "./test"),
    path.resolve(__dirname, "./lib"),
  ])
  .on("ready", () => console.log("Test watcher started.\n"))
  .on("change", () => {
    console.log(`Starting test process...`);
    spawn("yarn", ["workspace", name, "run", "test:nocov"], {
      stdio: "inherit",
    });
  });
