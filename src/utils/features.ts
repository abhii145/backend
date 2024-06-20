import { myCache } from "..";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { InvalidatesCacheProps, OrderItemType } from "./../types/types";

export const invalidatesCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidatesCacheProps) => {
  try {
    if (product) {
      const productKeys: string[] = [
        "latestProducts",
        "categoriesProducts",
        "admin-Products",
        `singleProduct-${productId}`,
      ];

      if (typeof productId === "string") {
        productKeys.push(`singleProduct-${productId}`);
      }

      if (typeof productId === "object") {
        productId.forEach((key) => {
          productKeys.push(`singleProduct-${key}`);
        });
      }
      myCache.del(productKeys);
    }

    if (order) {
      const orderKeys: string[] = [
        "allOrders",
        `my-orders-${userId}`,
        `order-${orderId}`,
      ];
      const orders = await Order.find().select("_id");

      orders.forEach((key) => {
        orderKeys.push(`order-${key._id}`);
      });
      myCache.del(orderKeys);
    }

    if (admin) {
      myCache.del([
        "admin-stats",
        "admin-pie-charts",
        "admin-bar-charts",
        "admin-line-charts",
      ]);
    }
  } catch (error) {
    console.error(error);
  }
};

export const reduceStock = async (orderItem: OrderItemType[]) => {
  try {
    for (let i = 0; i < orderItem.length; i++) {
      const order = orderItem[i];
      const product = await Product.findById(order.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      product.stock -= order.quantity;
      await product.save();
    }
  } catch (error) {}
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return categoryCount;
};

// interface MyDocument extends Document {
//   createdAt: Date;
//   discount?: number;
//   total?: number;
// }
// type FuncProps = {
//   length: number;
//   docArr: MyDocument[];
//   today: Date;
//   property?: "discount" | "total";
// };

interface MyDocument {
  createdAt: Date;
  discount?: number;
  total?: number;
}

export const getChartData = (
  months: number,
  data: MyDocument[],
  today: Date
): [string[], number[]] => {
  const chartData: [string[], number[]] = [[], []];
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);

  for (let i = 0; i < months; i++) {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const count = data.filter(
      (item) => item.createdAt >= startDate && item.createdAt < endDate
    ).length;

    chartData[0].push(startDate.toISOString().slice(0, 7));
    chartData[1].push(count);

    startDate.setMonth(startDate.getMonth() + 1);
  }

  return chartData;
};
