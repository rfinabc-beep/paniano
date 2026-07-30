export type Role = "customer" | "rider" | "admin";

export type ParcelStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export const STATUS_LABEL: Record<ParcelStatus, string> = {
  pending: "Booked",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Parcel {
  id: string;
  tracking_id: string;
  customer_id: string;
  sender_name: string;
  sender_phone: string;
  pickup_address: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  parcel_type: string;
  weight_kg: number | null;
  price: number;
  status: ParcelStatus;
  rider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryRow {
  id: string;
  parcel_id: string;
  status: ParcelStatus;
  note: string | null;
  created_at: string;
}
