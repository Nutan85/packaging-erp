import { testDatabaseConnection, pool } from "./config/db.js";

try {
  await testDatabaseConnection();
  console.log("MySQL database connected successfully!");
} catch (error) {
  console.error("Database connection failed:", error.message);
} finally {
  await pool.end();
}
