import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "To-Do List API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});