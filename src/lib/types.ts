export type Category = {
  id: string;
  name: string;
  sort: number;
};

export type NutritionInfo = {
  calories: number; // kcal
  proteins: number; // g
  carbs: number; // g
  fats: number; // g
  sodium?: number; // mg
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
  weight?: string;
  regenTime?: string;
  method?: string;
  tag?: string;
  highlight?: string;
  featured?: boolean;
  video?: string;
  nutrition?: NutritionInfo;
  created_at?: string;
  updated_at?: string;
};

export type DeliveryShift = {
  from: string;
  to: string;
};

export type DeliverySchedule = {
  enabled?: boolean;
  shifts?: DeliveryShift[];
};

export type Store = {
  name: string;
  tagline: string;
  cover: string;
  whatsapp: string;
  address: string;
  hours: string;
  deliverySchedule?: DeliverySchedule;
  about: string;
  open: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFee: number;
  deliveryMin: number;
  paymentNote: string;
  categories: Category[];
  dishes: Dish[];
  created_at?: string;
  updated_at?: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  base64: string;
  created_at: string;
  updated_at: string;
};

export type FirebaseConnectionState =
  | "connected"
  | "api_disabled"
  | "permission_denied"
  | "not_configured"
  | "error";

export type FirebaseStatusInfo = {
  configured: boolean;
  state: FirebaseConnectionState;
  projectId: string | null;
  storageBucket: string | null;
  message: string;
  consoleUrl?: string;
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

export type OrderStatus = "nuevo" | "aceptado" | "en_camino" | "completado" | "cancelado";

export type OrderItem = {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  fulfillment: Fulfillment;
  payment: Payment;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
