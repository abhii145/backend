import mongoose, { Schema } from "mongoose";
import { trim } from "validator";

const schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
    },
    category: {
      type: String,
        required: [true, "Category is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", schema);
