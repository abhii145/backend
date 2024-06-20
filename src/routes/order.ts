import { adminOnly } from "./../middlewares/auth";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order";

import express from "express";

const app = express.Router();

app.post("/new", newOrder);

app.get("/myorders", myOrders);

app.get("/all", adminOnly, allOrders);



app.route("/:id").get(getSingleOrder).put(adminOnly,processOrder).delete(adminOnly, deleteOrder);

export default app;
