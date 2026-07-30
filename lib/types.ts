export type Role = "customer" | "rider" | "admin";

export type ParcelStatus = string;

export interface StatusDef {
  key: string;
  label: string;
  sort_order: number;
  in_stepper: boolean;
  is_exception: boolean;
  default_note: string | null;
}

export type VehicleType = "Bike" | "Car" | "Van" | "Truck";

export const VEHICLE_TYPES: { type: VehicleType; label: string; blurb: string }[] = [
  { type: "Bike", label: "Bike", blurb: "Small parcels, fastest" },
  { type: "Car", label: "Car", blurb: "Medium parcels" },
  { type: "Van", label: "Van", blurb: "Multiple/bulk parcels" },
  { type: "Truck", label: "Truck", blurb: "Large or heavy shipments" },
];

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface RouteStop {
  address: string;
}

export interface Parcel {
  id: string;
  tracking_id: string;
  customer_id: string | null;
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
  vehicle_type: VehicleType;
  stops: RouteStop[];
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
