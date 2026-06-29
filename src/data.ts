import { MaterialType, PresetLocation, Quotation } from "./types";

export interface MaterialInfo {
  type: MaterialType;
  label: string;
  defaultPrice: number;
  unit: string;
  description: string;
}

export const MATERIALS: MaterialInfo[] = [
  {
    type: "bricks",
    label: "Bricks",
    defaultPrice: 125,
    unit: "Thousand",
    description: "High-quality solid common clay bricks for durable structures."
  },
  {
    type: "pit sand",
    label: "Pit Sand",
    defaultPrice: 15,
    unit: "Cubs",
    description: "Excellent pit sand, ideal for building plastering and masonry."
  },
  {
    type: "river sand",
    label: "River Sand",
    defaultPrice: 18,
    unit: "Cubs",
    description: "Clean, washed river sand suitable for concrete and paving work."
  },
  {
    type: "three-quarter stones",
    label: "Three-Quarter Stones",
    defaultPrice: 23,
    unit: "Cubs",
    description: "3/4 inch quarry stones (run of quarry) perfect for robust concrete mixing."
  },
  {
    type: "crusher run",
    label: "Crusher Run",
    defaultPrice: 25,
    unit: "Cubs",
    description: "Crushed stone aggregate base material for driveways and road layers."
  },
  {
    type: "quarry dust",
    label: "Quarry Dust",
    defaultPrice: 20,
    unit: "Cubs",
    description: "Fine quarry stone residue, excellent for pavers bedding and concrete blocks."
  },
  {
    type: "pavers",
    label: "Pavers",
    defaultPrice: 12,
    unit: "Sqm",
    description: "Aesthetic interlocking concrete paving blocks for driveways and pathways."
  }
];

export const PRESET_LOCATIONS: PresetLocation[] = [
  { name: "Harare CBD (Depot)", distanceKm: 5 },
  { name: "Mt Pleasant", distanceKm: 12 },
  { name: "Westgate", distanceKm: 15 },
  { name: "Borrowdale", distanceKm: 18 },
  { name: "Epworth", distanceKm: 20 },
  { name: "Ruwa", distanceKm: 25 },
  { name: "Chitungwiza", distanceKm: 28 },
  { name: "Norton", distanceKm: 40 },
  { name: "Custom Location", distanceKm: 30 }
];

// Transport pricing config
export const TRANSPORT_BASE_FEE = 50; // $50 base cost
export const TRANSPORT_RATE_PER_KM = 2.00; // $2 per km to support heavy material transport trucks

// Initial quotations corresponding to user's specified data points
export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: "sample-combined",
    quoteNumber: "QT-2026-001",
    clientName: "Camelon Demo Client",
    clientPhone: "+263 77 123 4567",
    clientEmail: "client@camelon.co.zw",
    deliveryAddress: "Chitungwiza Delivery Point",
    selectedLocationPreset: "Chitungwiza",
    distanceKm: 28,
    items: [
      {
        id: "item-bricks",
        material: "bricks",
        unitPrice: 125,
        quantity: 15,
        unit: "Thousand",
        subtotal: 1875
      },
      {
        id: "item-stones",
        material: "three-quarter stones",
        unitPrice: 23,
        quantity: 20,
        unit: "Cubs",
        subtotal: 460
      }
    ],
    transportCost: 600, // $400 for bricks transport, $200 for stones transport
    useCustomTransport: true,
    customTransportCost: 600, // Total transport: $400 + $200 = $600
    date: "2026-06-24",
    notes: "Demonstration Quote. Includes 15k Bricks & 20 Cubs Quarry Stones with user specified transport rates ($400 & $200).",
    subtotal: 2335, // $1875 + $460
    total: 2935 // Subtotal $2335 + Transport $600 = $2935
  },
  {
    id: "sample-stones",
    quoteNumber: "QT-2026-002",
    clientName: "John Doe (Stones Only)",
    clientPhone: "+263 71 987 6543",
    clientEmail: "jdoe@gmail.com",
    deliveryAddress: "Epworth Site",
    selectedLocationPreset: "Epworth",
    distanceKm: 20,
    items: [
      {
        id: "item-stones-2",
        material: "three-quarter stones",
        unitPrice: 23,
        quantity: 20,
        unit: "Cubs",
        subtotal: 460
      }
    ],
    transportCost: 200,
    useCustomTransport: true,
    customTransportCost: 200,
    date: "2026-06-24",
    notes: "20 Cubs quarry stones @ $23 with $200 Transport as requested.",
    subtotal: 460,
    total: 660
  },
  {
    id: "sample-bricks",
    quoteNumber: "QT-2026-003",
    clientName: "Sarah Smith (Bricks Only)",
    clientPhone: "+263 73 345 6789",
    clientEmail: "sarah@gmail.com",
    deliveryAddress: "Norton Housing Project",
    selectedLocationPreset: "Norton",
    distanceKm: 40,
    items: [
      {
        id: "item-bricks-2",
        material: "bricks",
        unitPrice: 125,
        quantity: 15,
        unit: "Thousand",
        subtotal: 1875
      }
    ],
    transportCost: 400,
    useCustomTransport: true,
    customTransportCost: 400,
    date: "2026-06-24",
    notes: "15 Thousand Bricks @ $125 with $400 Transport as requested.",
    subtotal: 1875,
    total: 2275
  }
];
