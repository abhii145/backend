export interface NewUserRequestBody {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
}

export interface BaseQuery {
  title?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
  description?: string;
}

export interface InvalidatesCacheProps {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
}

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};
