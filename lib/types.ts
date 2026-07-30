export type Role = "customer" | "rider" | "admin";

export type ParcelStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export const STATUS_LABEL_BN: Record<ParcelStatus, string> = {
  pending: "বুকিং হয়েছে",
  picked_up: "পিকআপ হয়েছে",
  in_transit: "পথে আছে",
  delivered: "ডেলিভারি সম্পন্ন",
  cancelled: "বাতিল হয়েছে",
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
