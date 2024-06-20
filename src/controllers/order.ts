import { Request, Response } from "express";
import { Order } from "./../models/order";
import { invalidatesCache, reduceStock } from "../utils/features";
import { myCache } from "..";

export const newOrder = async (req: Request, res: Response) => {
  try {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (
      !shippingInfo ||
      !orderItems ||
      !user ||
      !subtotal ||
      !tax ||
      !shippingCharges ||
      !discount ||
      !total
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

 const order =   await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);
    await invalidatesCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId:order.orderItems.map((item) => String(item.productId)),
    });

    return res.status(201).json({ success: true, message: "Order created" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const myOrders = async (req: Request, res: Response) => {
  try {
    const { id: user } = req.query;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    let orders = [];

    if (myCache.has(`my-orders-${user}`)) {
      orders = JSON.parse(myCache.get(`my-orders-${user}`)!);
    } else {
      orders = await Order.find({ user });
      myCache.set(`my-orders-${user}`, JSON.stringify(orders));
    }
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const allOrders = async (req: Request, res: Response) => {
  try {
    let orders = [];

    if (myCache.has("all-orders")) {
      orders = JSON.parse(myCache.get("all-orders")!);
    } else {
      orders = await Order.find().populate("user", "name");
      myCache.set("all-orders", JSON.stringify(orders));
    }
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let order = [];

    if (myCache.has(`order-${id}`)) {
      order = JSON.parse(myCache.get(`order-${id}`)!);
    } else {
      const order = await Order.findById(id).populate("user", "name");
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      myCache.set(`order-${id}`, JSON.stringify(order));
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const processOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }

    await order.save();
  invalidatesCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

    return res.status(200).json({
      success: true,
      message: "Order Processed Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    invalidatesCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });

    return res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
