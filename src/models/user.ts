import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  age: number;
}

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
      validate: validator.default.isEmail,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", schema);
