const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const processes = [
  {
    name: "server",
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev:server"],
    cwd: rootDir,
  },
  {
    name: "client",
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev:client"],
    cwd: rootDir,
  },
];

let shuttingDown = false;
const children = [];

const prefixOutput = (name, stream, chunk) => {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line && index === lines.length - 1) {
      return;
    }

    stream.write(`[${name}] ${line}\n`);
  });
};

const shutdown = (signal = "SIGTERM") => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  children.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

processes.forEach(({ name, command, args, cwd }) => {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);

  child.stdout.on("data", (chunk) => {
    prefixOutput(name, process.stdout, chunk);
  });

  child.stderr.on("data", (chunk) => {
    prefixOutput(name, process.stderr, chunk);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.stderr.write(`[${name}] exited with signal ${signal}\n`);
    } else if (code !== 0 && !shuttingDown) {
      process.stderr.write(`[${name}] exited with code ${code}\n`);
    }

    if (!shuttingDown) {
      shutdown();
      process.exit(code || 0);
    }
  });
});
