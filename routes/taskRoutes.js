import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

router.use(authenticate);
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
