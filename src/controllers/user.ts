import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const getallUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Please provide user id" });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, role } = user;
    const userDetails = { name, email, role };
    console.log(userDetails)

    return res.status(200).json({ success: true, userDetails });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Please provide user id" });

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Please provide all fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email ID already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === "admin" ? "admin" : "user";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const savedUser = await newUser.save();

    const details = { name, email, _id: savedUser._id, role: savedUser.role };

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

   res.cookie("token", token, {
     httpOnly: true,
     secure: false, // Set to true if using HTTPS
     sameSite: "lax",
   });

    res
      .status(200)
      .json({ details, token, message: "User signed up successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ error: "An error occurred during signup. Please try again." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ error: "Email ID does not exist" });
    }

    const { name, _id, role } = existingUser;
    const details = { name, email, _id, role };

    const isPasswordCorrect = compareSync(
      password,
      existingUser.password || ""
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: _id, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

   res.cookie("token", token, {
     httpOnly: true,
     secure: false, // Set to true if using HTTPS
     sameSite: "lax",
   });

    return res
      .status(200)
      .json({ token, details, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
