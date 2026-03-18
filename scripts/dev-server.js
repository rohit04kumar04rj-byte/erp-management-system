const { spawn } = require("child_process");
const path = require("path");
const { ensureMongo } = require("./ensureMongo");

const rootDir = path.resolve(__dirname, "..");

const startServer = async () => {
  try {
    const { started } = await ensureMongo();
    process.stdout.write(
      started
        ? "[mongo] Started local MongoDB on 127.0.0.1:27017\n"
        : "[mongo] Using existing MongoDB on 127.0.0.1:27017\n"
    );
  } catch (error) {
    process.stderr.write(`[mongo] ${error.message}\n`);
    process.exit(1);
  }

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["nodemon", "server/server.js"],
    {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code || 0);
  });
};

startServer();
