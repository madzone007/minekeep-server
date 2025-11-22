// Keep-alive webserver for Java server
const express = require("express");
const app = express();

// Configuration
const DEFAULT_PORT = 3000; // Start with port 3000 as required
const MAX_PORT_ATTEMPTS = 10; // Try up to 10 ports

// Simple route to confirm bot is alive
app.get("/", (req, res) => {
  res.send("Minecraft Java Bot is alive and ready!");
  console.log("Ping received at:", new Date().toLocaleTimeString());
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    message: "Minecraft bot is running",
  });
});

// Function to start server with port fallback
function startServer(portAttempt = 0) {
  const currentPort = DEFAULT_PORT + portAttempt;

  const server = app.listen(currentPort, "0.0.0.0", () => {
    console.log(`✅ Keep-alive webserver running on port ${currentPort}`);
    console.log(`📍 Local: http://localhost:${currentPort}`);
    console.log(`🌐 Health check: http://localhost:${currentPort}/health`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`❌ Port ${currentPort} is busy.`);

      if (portAttempt < MAX_PORT_ATTEMPTS) {
        console.log(`🔄 Trying port ${currentPort + 1}...`);
        setTimeout(() => startServer(portAttempt + 1), 1000);
      } else {
        console.log(
          `💥 Failed to find available port after ${MAX_PORT_ATTEMPTS} attempts`,
        );
        console.log(
          "⚠️  Keep-alive server will not run, but bot will continue",
        );
      }
    } else {
      console.log("💥 Web server error:", err.message);
    }
  });

  // Graceful shutdown handling
  server.on("close", () => {
    console.log(`🔴 Keep-alive server on port ${currentPort} has been closed`);
  });

  // Store server reference for graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down keep-alive server...");
    server.close(() => {
      console.log("✅ Keep-alive server shut down gracefully");
      process.exit(0);
    });
  });

  return server;
}

// Start the server
console.log("🚀 Starting keep-alive webserver...");
startServer();

// Export for testing purposes
module.exports = app;
