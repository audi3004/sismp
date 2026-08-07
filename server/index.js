import express from "express";
import cors from "cors";
import { sequelize, seedAdmin } from "./models.js";
import { serverConfig } from "./config.js";
import router from "./routes.js";

const app = express();
const PORT = serverConfig.port;

app.use(cors());
app.use(express.json());

// Initialize database connection gracefully
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✔ MySQL/MariaDB Database Connection Established successfully.");

    // Sync tables automatically (Updates existing tables dynamically)
    await sequelize.sync({ alter: true });
    console.log("✔ Database schema synchronized with existing structure.");

    // Run automated default Admin user seeder
    await seedAdmin();
  } catch (error) {
    console.warn("⚠ WARNING: Cannot establish live connection to Localhost MySQL/MariaDB database.");
    console.warn("Continuing server boot without database backend to allow static operation/UI testing.");
    console.warn("Error context:", error.message);
  }
};

await initDatabase();

// API routing mount
app.use("/api", router);

// Base / Health Check route
app.get("/", (req, res) => {
  res.json({ status: "online", service: "SISMP Backend API", port: PORT });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SISMP Backend Mode] Running at http://localhost:${PORT}`);
});
