import { singleUpload } from "./../middlewares/multer";
import {
  getLatestProducts,
  getAllProductByCategory,
  newProduct,
  getAdminProducts,
  getSingleProduct,
  deleteProductById,
  updateProductById,
  getAllProducts,
} from "./../controllers/product";
import { adminOnly } from "./../middlewares/auth";
import express from "express";

const app = express.Router();

//route - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/latest", getLatestProducts);
app.get("/categories", getAllProductByCategory);
app.get("/admin-products", adminOnly, getAdminProducts);
app.get("/all", getAllProducts);

// app.get("/:id", getSingleProduct);
// app.put("/:id", adminOnly, singleUpload, updateProductById);
// app.delete("/:id", adminOnly, deleteProductById);

app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProductById)
  .delete(adminOnly, deleteProductById);
export default app;
