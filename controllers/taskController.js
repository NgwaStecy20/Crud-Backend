import prisma from "../config/database.js";
import { createHttpError } from "../middleware/validate.js";

function parseDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, "Due date must be a valid date");
  }
  return date;
}

async function findOwnedTask(taskId, userId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  return task;
}

export async function createTask(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() || null : null;
    const dueDate =
      body.dueDate === undefined ? null : parseDueDate(body.dueDate);

    if (!title) {
      throw createHttpError(400, "Task title is required");
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        completed: false,
        userId: req.userId,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function getTasks(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await findOwnedTask(req.params.id, req.userId);
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    await findOwnedTask(req.params.id, req.userId);

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const title =
      body.title === undefined
        ? undefined
        : typeof body.title === "string"
          ? body.title.trim()
          : null;
    const description =
      body.description === undefined
        ? undefined
        : typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    const dueDate =
      body.dueDate === undefined ? undefined : parseDueDate(body.dueDate);

    if (title !== undefined && !title) {
      throw createHttpError(400, "Task title cannot be empty");
    }

    let completed;
    if (body.completed !== undefined) {
      if (typeof body.completed !== "boolean") {
        throw createHttpError(400, "Completed must be a boolean");
      }
      completed = body.completed;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { title, description, dueDate, completed },
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(req, res, next) {
  try {
    await findOwnedTask(req.params.id, req.userId);

    const body = req.body && typeof req.body === "object" ? req.body : {};
    if (typeof body.completed !== "boolean") {
      throw createHttpError(400, "Completed must be a boolean");
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { completed: body.completed },
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await findOwnedTask(req.params.id, req.userId);
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
