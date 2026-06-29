export type MaterialType = 
  | "bricks"
  | "pit sand"
  | "river sand"
  | "three-quarter stones"
  | "crusher run"
  | "quarry dust"
  | "pavers";

export interface QuotationItem {
  id: string;
  material: MaterialType | string;
  unitPrice: number;
  quantity: number;
  unit: string; // e.g. "Thousand", "Cubs", "Sqm"
  subtotal: number;
}

export interface PresetLocation {
  name: string;
  distanceKm: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryAddress: string;
  selectedLocationPreset?: string;
  distanceKm: number;
  items: QuotationItem[];
  transportCost: number;
  useCustomTransport: boolean;
  customTransportCost: number;
  date: string;
  notes: string;
  subtotal: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  selectedLocationPreset?: string;
  distanceKm?: number;
}

