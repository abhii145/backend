import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";

// middle ware to check if user is admin
export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Please provide user id" });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You are not authorized to perform this action" });
  }

  next();
};
