import { Request, Response } from "express";
import { Coupon } from "../models/coupon";
import { stripe } from "..";

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount * 100),
      currency: "inr",
    });

    return res
      .status(201)
      .json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const newCoupon = async (req: Request, res: Response) => {
  try {
    const { coupon, amount } = req.body;

    if (!coupon || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    await Coupon.create({ coupon, amount });

    return res
      .status(201)
      .json({ success: true, message: `Coupon ${coupon} created` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const { coupon } = req.query;

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "please enter coupon" });
    }

    const discount = await Coupon.findOne({ coupon: coupon });

    if (!discount) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    return res.status(201).json({
      success: true,
      discount: discount?.amount,
      message: `Coupon ${coupon} applied and discount is ${discount?.amount}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const allCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find();
    return res.status(200).json({ success: true, coupons });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide coupon id" });
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    console.log(coupon);

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: `coupon ${coupon?.coupon} deleted` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
