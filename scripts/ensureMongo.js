const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const HOST = process.env.MONGO_HOST || "127.0.0.1";
const PORT = Number(process.env.MONGO_PORT || 27017);
const DB_PATH = path.resolve(__dirname, "..", "server", "data", "db");
const LOG_PATH = path.resolve(__dirname, "..", "server", "data", "mongod.log");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isMongoRunning = () =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host: HOST, port: PORT });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });

const startMongo = async () => {
  if (await isMongoRunning()) {
    return { started: false };
  }

  fs.mkdirSync(DB_PATH, { recursive: true });
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

  await new Promise((resolve, reject) => {
    const child = spawn(
      "mongod",
      [
        "--dbpath",
        DB_PATH,
        "--bind_ip",
        HOST,
        "--port",
        String(PORT),
        "--logpath",
        LOG_PATH,
        "--fork",
      ],
      {
        cwd: path.resolve(__dirname, ".."),
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(stderr.trim() || `mongod exited with code ${code}`)
      );
    });
  });

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await isMongoRunning()) {
      return { started: true };
    }

    await wait(500);
  }

  throw new Error("MongoDB did not become ready in time");
};

module.exports = {
  ensureMongo: startMongo,
};

if (require.main === module) {
  startMongo()
    .then(({ started }) => {
      process.stdout.write(
        started
          ? "MongoDB started on 127.0.0.1:27017\n"
          : "MongoDB already running on 127.0.0.1:27017\n"
      );
    })
    .catch((error) => {
      process.stderr.write(`Failed to start MongoDB: ${error.message}\n`);
      process.exit(1);
    });
}
