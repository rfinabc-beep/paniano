import { VehicleType } from "@/lib/types";

export default function VehicleIcon({ type, className }: { type: VehicleType; className?: string }) {
  const common = { className, viewBox: "0 0 48 48", fill: "none" as const, xmlns: "http://www.w3.org/2000/svg" };

  switch (type) {
    case "Bike":
      return (
        <svg {...common}>
          <circle cx="12" cy="34" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="36" cy="34" r="6" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 34l8-16h6l6 16M20 18l6 8h10M18 34h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="18" r="2" fill="currentColor" />
        </svg>
      );
    case "Car":
      return (
        <svg {...common}>
          <path
            d="M8 30V24l4-8h20l6 8v6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="6" y="24" width="36" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M14 24l2-6h14l4 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="15" cy="34" r="3.5" fill="currentColor" />
          <circle cx="33" cy="34" r="3.5" fill="currentColor" />
        </svg>
      );
    case "Van":
      return (
        <svg {...common}>
          <rect x="5" y="16" width="26" height="15" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <path d="M31 22h8l4 5v4h-12v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="14" cy="33" r="3.5" fill="currentColor" />
          <circle cx="35" cy="33" r="3.5" fill="currentColor" />
          <path d="M5 24h26" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "Truck":
      return (
        <svg {...common}>
          <rect x="4" y="12" width="24" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <path d="M28 20h8l6 6v4h-14v-10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="13" cy="33" r="3.5" fill="currentColor" />
          <circle cx="35" cy="33" r="3.5" fill="currentColor" />
          <path d="M4 24h24" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}
