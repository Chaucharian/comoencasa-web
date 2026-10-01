export type Category = {
  id: string;
  name: string;
  sort: number;
};

export type Dish = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  available: boolean;
  sort: number;
};

export type Store = {
  name: string;
  tagline: string;
  cover: string;
  whatsapp: string;
  address: string;
  hours: string;
  about: string;
  open: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFee: number;
  deliveryMin: number;
  paymentNote: string;
  categories: Category[];
  dishes: Dish[];
};

export type CartLine = {
  lineId: string;
  dishId: string;
  name: string;
  price: number;
  qty: number;
  note: string;
};

export type Fulfillment = "pickup" | "delivery";

export type Payment = "efectivo" | "transferencia";

export type Customer = {
  name: string;
  phone: string;
  address: string;
  when: string;
  payment: Payment;
  note: string;
};
