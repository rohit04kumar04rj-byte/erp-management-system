// Root entrypoint for Render deployment
// Render is running `node app.js`, so this file starts the actual server.

console.log("Starting root app.js");
console.log("NODE_ENV=", process.env.NODE_ENV);
console.log("PORT=", process.env.PORT);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

require("./server/server");
