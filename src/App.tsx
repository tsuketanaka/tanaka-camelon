import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  Check, 
  MapPin, 
  Save, 
  Square, 
  CheckSquare, 
  ChevronDown, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowRight, 
  Clock, 
  List, 
  Send, 
  RefreshCw, 
  Sparkles,
  Users,
  Pencil,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Quotation, QuotationItem, MaterialType, Customer } from "./types";
import { MATERIALS, PRESET_LOCATIONS, INITIAL_QUOTATIONS, TRANSPORT_BASE_FEE, TRANSPORT_RATE_PER_KM } from "./data";
import { generateQuotationPDF } from "./utils/pdfGenerator";
import { CamelonLogo } from "./components/CamelonLogo";

export default function App() {
  // Tabs: 'create' | 'preview' | 'history' | 'customers'
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "history" | "customers">("create");

  // Saved quotations state
  const [savedQuotes, setSavedQuotes] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem("camelon_quotes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved quotations", e);
      }
    }
    return INITIAL_QUOTATIONS;
  });

  // Current active quote state
  const [activeQuote, setActiveQuote] = useState<Quotation>({
    id: "draft-current",
    quoteNumber: "QT-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900)),
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    deliveryAddress: "",
    selectedLocationPreset: "Harare CBD (Depot)",
    distanceKm: 5,
    items: [
      {
        id: "item-bricks-default",
        material: "bricks",
        unitPrice: 125,
        quantity: 15,
        unit: "Thousand",
        subtotal: 1875
      }
    ],
    transportCost: 60, // base 50 + 5km * $2 = 60
    useCustomTransport: false,
    customTransportCost: 60,
    date: new Date().toISOString().split("T")[0],
    notes: "Delivery of materials within specified delivery timeline.",
    subtotal: 1875,
    total: 1935
  });

  // Dropdown menus states
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Customers database and editor state
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("camelon_customers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved customers", e);
      }
    }
    return [
      {
        id: "cust-1",
        name: "John Doe",
        phone: "+263 77 123 4567",
        email: "john.doe@gmail.com",
        deliveryAddress: "Epworth Site Depot",
        selectedLocationPreset: "Epworth",
        distanceKm: 20
      },
      {
        id: "cust-2",
        name: "Sarah Smith",
        phone: "+263 73 345 6789",
        email: "sarah@gmail.com",
        deliveryAddress: "Norton Housing Project",
        selectedLocationPreset: "Norton",
        distanceKm: 40
      },
      {
        id: "cust-3",
        name: "David Moyo",
        phone: "+263 71 222 3333",
        email: "davidmoyo@gmail.com",
        deliveryAddress: "Borrowdale Residential Site",
        selectedLocationPreset: "Borrowdale",
        distanceKm: 18
      }
    ];
  });

  // Save customers to local storage
  useEffect(() => {
    localStorage.setItem("camelon_customers", JSON.stringify(customers));
  }, [customers]);

  // States for Customer form management
  const [isCustomerEditing, setIsCustomerEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerEmailInput, setCustomerEmailInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");
  const [customerPresetLocation, setCustomerPresetLocation] = useState("Harare CBD (Depot)");
  const [customerDistanceKm, setCustomerDistanceKm] = useState(5);
  const [isSelectCustomerOpen, setIsSelectCustomerOpen] = useState(false);
  const [customerLocationDropdownOpen, setCustomerLocationDropdownOpen] = useState(false);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [simulatedSendStatus, setSimulatedSendStatus] = useState<"idle" | "sending" | "success">("idle");
  const [sendToEmail, setSendToEmail] = useState("");

  // Save quotes to local storage
  useEffect(() => {
    localStorage.setItem("camelon_quotes", JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  // Recalculate transport costs and subtotals automatically when distance, items, or transport settings change
  useEffect(() => {
    const itemsSubtotal = activeQuote.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Formula for auto-calculated transport: Base fee + Rate per km
    // And dynamic load scaling: More items = slightly higher transport
    const loadMultiplier = Math.max(1, activeQuote.items.reduce((multiplier, item) => {
      // Bricks are extremely heavy, each thousand adds a weight factor
      if (item.material === "bricks") return multiplier + (item.quantity * 0.05);
      // Stones/Sands are heavy aggregate per Cub
      return multiplier + (item.quantity * 0.02);
    }, 0.5));

    const autoCalculatedTransport = Math.round(
      (TRANSPORT_BASE_FEE + (activeQuote.distanceKm * TRANSPORT_RATE_PER_KM)) * loadMultiplier
    );

    const transportCostVal = activeQuote.useCustomTransport 
      ? activeQuote.customTransportCost 
      : autoCalculatedTransport;

    setActiveQuote(prev => ({
      ...prev,
      subtotal: itemsSubtotal,
      transportCost: autoCalculatedTransport,
      total: itemsSubtotal + transportCostVal
    }));
  }, [
    activeQuote.items, 
    activeQuote.distanceKm, 
    activeQuote.useCustomTransport, 
    activeQuote.customTransportCost
  ]);

  // Handle client detail changes
  const handleClientChange = (field: keyof Quotation, value: any) => {
    setActiveQuote(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Preset location handler
  const handleLocationPresetSelect = (name: string, distance: number) => {
    setActiveQuote(prev => ({
      ...prev,
      selectedLocationPreset: name,
      distanceKm: distance,
      deliveryAddress: name === "Custom Location" ? prev.deliveryAddress : name
    }));
    setIsLocationDropdownOpen(false);
  };

  // Toggle material selected in checkbox list
  const handleToggleMaterial = (materialType: MaterialType) => {
    const exists = activeQuote.items.find(item => item.material === materialType);
    
    if (exists) {
      // Remove item
      setActiveQuote(prev => ({
        ...prev,
        items: prev.items.filter(item => item.material !== materialType)
      }));
    } else {
      // Add item with default pricing
      const materialMeta = MATERIALS.find(m => m.type === materialType);
      if (materialMeta) {
        // Set sensible initial quantity matching requested data point if possible
        let initialQuantity = 10;
        if (materialType === "bricks") initialQuantity = 15;
        if (materialType === "three-quarter stones") initialQuantity = 20;

        const newItem: QuotationItem = {
          id: `item-${Date.now()}-${materialType}`,
          material: materialType,
          unitPrice: materialMeta.defaultPrice,
          quantity: initialQuantity,
          unit: materialMeta.unit,
          subtotal: materialMeta.defaultPrice * initialQuantity
        };

        setActiveQuote(prev => ({
          ...prev,
          items: [...prev.items, newItem]
        }));
      }
    }
  };

  // Handle unit price or quantity change for active items
  const handleItemValueChange = (itemId: string, field: "unitPrice" | "quantity", value: number) => {
    setActiveQuote(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedValue = Math.max(0, value);
          const updatedUnitPrice = field === "unitPrice" ? updatedValue : item.unitPrice;
          const updatedQuantity = field === "quantity" ? updatedValue : item.quantity;
          return {
            ...item,
            [field]: updatedValue,
            subtotal: updatedUnitPrice * updatedQuantity
          };
        }
        return item;
      })
    }));
  };

  // Save currently active quotation
  const handleSaveQuotation = () => {
    if (!activeQuote.clientName.trim()) {
      alert("Please enter a Client Name before saving the quotation.");
      return;
    }

    const index = savedQuotes.findIndex(q => q.id === activeQuote.id);
    const newQuoteNumber = activeQuote.id === "draft-current" 
      ? "QT-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900))
      : activeQuote.quoteNumber;

    const quoteToSave: Quotation = {
      ...activeQuote,
      id: activeQuote.id === "draft-current" ? `quote-${Date.now()}` : activeQuote.id,
      quoteNumber: newQuoteNumber
    };

    if (index > -1) {
      // Update existing
      setSavedQuotes(prev => prev.map(q => q.id === activeQuote.id ? quoteToSave : q));
    } else {
      // Add new
      setSavedQuotes(prev => [quoteToSave, ...prev]);
    }

    setActiveQuote(quoteToSave);
    setActiveTab("history");
  };

  // Create clean blank quotation
  const handleCreateNewQuotation = () => {
    setActiveQuote({
      id: "draft-current",
      quoteNumber: "QT-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900)),
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      deliveryAddress: "",
      selectedLocationPreset: "Harare CBD (Depot)",
      distanceKm: 5,
      items: [],
      transportCost: 50,
      useCustomTransport: false,
      customTransportCost: 50,
      date: new Date().toISOString().split("T")[0],
      notes: "Delivery of materials within specified delivery timeline.",
      subtotal: 0,
      total: 50
    });
    setActiveTab("create");
  };

  // Load saved quotation for editing
  const handleLoadQuotation = (quote: Quotation) => {
    setActiveQuote(quote);
    setActiveTab("create");
  };

  // Delete saved quotation
  const handleDeleteQuotation = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this quotation?")) {
      setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
      if (activeQuote.id === quoteId) {
        handleCreateNewQuotation();
      }
    }
  };

  // Start creating a new customer
  const handleStartNewCustomer = () => {
    setEditingCustomer(null);
    setCustomerNameInput("");
    setCustomerPhoneInput("");
    setCustomerEmailInput("");
    setCustomerAddressInput("");
    setCustomerPresetLocation("Harare CBD (Depot)");
    setCustomerDistanceKm(5);
    setIsCustomerEditing(true);
  };

  // Start editing an existing customer
  const handleEditCustomerClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerNameInput(customer.name);
    setCustomerPhoneInput(customer.phone);
    setCustomerEmailInput(customer.email);
    setCustomerAddressInput(customer.deliveryAddress);
    setCustomerPresetLocation(customer.selectedLocationPreset || "Harare CBD (Depot)");
    setCustomerDistanceKm(customer.distanceKm !== undefined ? customer.distanceKm : 5);
    setIsCustomerEditing(true);
  };

  // Save / Update Customer
  const handleSaveCustomer = () => {
    if (!customerNameInput.trim()) {
      alert("Please enter a customer name.");
      return;
    }

    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: customerNameInput.trim(),
      phone: customerPhoneInput.trim(),
      email: customerEmailInput.trim(),
      deliveryAddress: customerAddressInput.trim(),
      selectedLocationPreset: customerPresetLocation,
      distanceKm: customerDistanceKm
    };

    if (editingCustomer) {
      // Update
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? customerData : c));
    } else {
      // Add
      setCustomers(prev => [customerData, ...prev]);
    }

    setIsCustomerEditing(false);
    setEditingCustomer(null);
  };

  // Delete Customer
  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer record?")) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  // Load Customer into current Quotation
  const handleSelectCustomer = (customer: Customer) => {
    setActiveQuote(prev => ({
      ...prev,
      clientName: customer.name,
      clientPhone: customer.phone,
      clientEmail: customer.email,
      deliveryAddress: customer.deliveryAddress,
      selectedLocationPreset: customer.selectedLocationPreset || prev.selectedLocationPreset,
      distanceKm: customer.distanceKm !== undefined ? customer.distanceKm : prev.distanceKm
    }));
    setIsSelectCustomerOpen(false);
  };

  // Quick preset loader (user specs)
  const loadPresetData = (type: "stones" | "bricks" | "combined") => {
    if (type === "stones") {
      setActiveQuote({
        id: "draft-stones-preset",
        quoteNumber: "QT-2026-STONES",
        clientName: "Quarry Stones Delivery",
        clientPhone: "+263 77 123 0001",
        clientEmail: "stones@camelon.co.zw",
        deliveryAddress: "Epworth Site Depot",
        selectedLocationPreset: "Epworth",
        distanceKm: 20,
        items: [
          {
            id: "stones-preset",
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
        date: new Date().toISOString().split("T")[0],
        notes: "20 Cubs quarry stones @ $23 with $200 Transport as requested.",
        subtotal: 460,
        total: 660
      });
    } else if (type === "bricks") {
      setActiveQuote({
        id: "draft-bricks-preset",
        quoteNumber: "QT-2026-BRICKS",
        clientName: "Solid Clay Bricks Delivery",
        clientPhone: "+263 77 123 0002",
        clientEmail: "bricks@camelon.co.zw",
        deliveryAddress: "Norton Residential Project",
        selectedLocationPreset: "Norton",
        distanceKm: 40,
        items: [
          {
            id: "bricks-preset",
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
        date: new Date().toISOString().split("T")[0],
        notes: "15 Thousand Bricks @ $125 with $400 Transport as requested.",
        subtotal: 1875,
        total: 2275
      });
    } else {
      // Combined total balance $2935
      setActiveQuote({
        id: "draft-combined-preset",
        quoteNumber: "QT-2026-COMBINED",
        clientName: "Camelon Grand Build",
        clientPhone: "+263 77 555 9999",
        clientEmail: "build@camelon.co.zw",
        deliveryAddress: "Chitungwiza Commercial Site",
        selectedLocationPreset: "Chitungwiza",
        distanceKm: 28,
        items: [
          {
            id: "comb-bricks",
            material: "bricks",
            unitPrice: 125,
            quantity: 15,
            unit: "Thousand",
            subtotal: 1875
          },
          {
            id: "comb-stones",
            material: "three-quarter stones",
            unitPrice: 23,
            quantity: 20,
            unit: "Cubs",
            subtotal: 460
          }
        ],
        transportCost: 600,
        useCustomTransport: true,
        customTransportCost: 600,
        date: new Date().toISOString().split("T")[0],
        notes: "Combined quote representing 15k Bricks & 20 Cubs Stones. Matches target $2,935.00 total.",
        subtotal: 2335,
        total: 2935
      });
    }
    setActiveTab("create");
  };

  // Run PDF download
  const handleDownloadPDF = () => {
    generateQuotationPDF(activeQuote);
  };

  // Simulated direct email sending logic
  const handleSimulateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendToEmail) return;

    setSimulatedSendStatus("sending");
    setTimeout(() => {
      setSimulatedSendStatus("success");
      setTimeout(() => {
        setIsShareModalOpen(false);
        setSimulatedSendStatus("idle");
        setSendToEmail("");
      }, 1800);
    }, 2000);
  };

  // WhatsApp formatted message
  const getWhatsAppLink = () => {
    const lineBreak = "%0A";
    let message = `*CAMELON QUOTATION SERVICES*${lineBreak}`;
    message += `*Quote Ref:* ${activeQuote.quoteNumber}${lineBreak}`;
    message += `*Date:* ${activeQuote.date}${lineBreak}`;
    message += `----------------------------${lineBreak}`;
    message += `*Client:* ${activeQuote.clientName || "Valued Customer"}${lineBreak}`;
    message += `*Delivery Site:* ${activeQuote.deliveryAddress || "Self-Collection"}${lineBreak}`;
    message += `*Distance:* ${activeQuote.distanceKm} km${lineBreak}${lineBreak}`;
    
    message += `*Items:*${lineBreak}`;
    activeQuote.items.forEach(item => {
      const meta = MATERIALS.find(m => m.type === item.material);
      const name = meta ? meta.label : item.material;
      message += `- ${name}: ${item.quantity} ${item.unit} x $${item.unitPrice} = *$${item.subtotal}*${lineBreak}`;
    });
    
    message += `----------------------------${lineBreak}`;
    message += `*Materials Subtotal:* $${activeQuote.subtotal}${lineBreak}`;
    message += `*Transport Fee:* $${activeQuote.transportCost}${lineBreak}`;
    message += `*GRAND TOTAL:* *$${activeQuote.total}*${lineBreak}${lineBreak}`;
    message += `Thank you for choosing Camelon.`;

    return `https://wa.me/?text=${message}`;
  };

  // Email formatted message
  const getEmailLink = () => {
    const subject = encodeURIComponent(`Camelon Quotation Ref ${activeQuote.quoteNumber}`);
    let body = `Dear ${activeQuote.clientName || "Valued Customer"},\n\n`;
    body += `Please find below the official quotation from Camelon Materials & Transport:\n\n`;
    body += `Quote Ref: ${activeQuote.quoteNumber}\n`;
    body += `Date: ${activeQuote.date}\n`;
    body += `Delivery Address: ${activeQuote.deliveryAddress || "Self-Collection"}\n\n`;
    body += `ITEMS:\n`;
    activeQuote.items.forEach(item => {
      const meta = MATERIALS.find(m => m.type === item.material);
      const name = meta ? meta.label : item.material;
      body += `- ${name}: ${item.quantity} ${item.unit} @ $${item.unitPrice} = $${item.subtotal}\n`;
    });
    body += `\nMaterials Subtotal: $${activeQuote.subtotal}\n`;
    body += `Transport Cost: $${activeQuote.transportCost}\n`;
    body += `TOTAL BALANCE DUE: $${activeQuote.total}\n\n`;
    body += `You can download the full formal PDF file using the app.\n\n`;
    body += `Best Regards,\nCamelon Logistics Department`;

    return `mailto:${activeQuote.clientEmail || ""}?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div id="camelon_app" className="bg-[#0f172a] min-h-screen flex items-center justify-center p-0 sm:p-4 select-none font-sans antialiased text-[#1e293b]">
      
      {/* Interactive Mobile Simulator Container */}
      <div id="mobile_frame" className="w-full max-w-sm h-full sm:h-[820px] bg-[#f8fafc] sm:rounded-[40px] border-8 border-[#334155] overflow-hidden flex flex-col relative shadow-2xl">
        
        {/* Status Bar for Mobile aesthetic */}
        <div className="h-10 px-6 flex justify-between items-center text-xs text-[#1e293b] font-bold select-none shrink-0 bg-[#f8fafc] border-b border-slate-100">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-orange-500 tracking-wider text-[10px] font-display">CAMELON</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Corporate App Header Section */}
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#172554] px-4 py-4.5 text-white relative overflow-hidden shrink-0">
          {/* Subtle construction graphic elements */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Sparkles className="w-40 h-40 text-[#fb923c]" />
          </div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2.5">
              {/* Brand logo image cropped to emblem */}
              <CamelonLogo size="sm" showText={false} />
              <div>
                <span className="text-base font-black tracking-[0.18em] text-white font-mono flex items-center leading-none">
                  C
                  <span className="relative inline-block leading-none">
                    A
                    <span 
                      className="absolute left-1/2 bottom-[1.5px] -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: "3.5px solid transparent",
                        borderRight: "3.5px solid transparent",
                        borderBottom: "5px solid #fb923c"
                      }}
                    />
                  </span>
                  MELON
                </span>
                <p className="text-[8px] uppercase tracking-widest text-[#fb923c] font-extrabold mt-1 leading-tight">Building Foundations. Delivering Quality.</p>
              </div>
            </div>
            
            {/* Quick Presets Badge */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] text-blue-300 uppercase tracking-widest font-semibold">Presets:</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => loadPresetData("stones")}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/10 transition"
                  title="Load 20 Cubs stones & $200 Transport"
                >
                  Stones
                </button>
                <button 
                  onClick={() => loadPresetData("bricks")}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/10 transition"
                  title="Load 15k Bricks & $400 Transport"
                >
                  Bricks
                </button>
                <button 
                  onClick={() => loadPresetData("combined")}
                  className="bg-[#fb923c] hover:bg-[#ea580c] active:scale-95 text-white font-bold px-1.5 py-0.5 rounded text-[9px] font-mono border border-orange-600 transition"
                  title="Load both for $2,935.00 Total"
                >
                  Combo
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 relative z-10">
            <span className="text-[10px] text-blue-200 font-mono">Date: 2026-06-24</span>
            
            <div className="flex gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === "create" ? "bg-[#fb923c]" : "bg-white/30"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === "preview" ? "bg-[#fb923c]" : "bg-white/30"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === "history" ? "bg-[#fb923c]" : "bg-white/30"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === "customers" ? "bg-[#fb923c]" : "bg-white/30"}`} />
            </div>
          </div>
        </div>

        {/* Inner Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-thin scrollbar-thumb-slate-200">
          <AnimatePresence mode="wait">
            
            {/* 1. CREATE QUOTATION TAB */}
            {activeTab === "create" && (
              <motion.div
                key="create-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 space-y-5"
              >
                {/* Section A: Customer Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Client Details</h2>
                    <span className="text-[11px] text-[#1e3a8a] font-mono font-bold">{activeQuote.quoteNumber}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm relative flex items-center">
                      <User className="w-4 h-4 text-[#94a3b8] mr-2.5 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">Client Full Name</span>
                        <input 
                          type="text" 
                          placeholder="Enter customer name..."
                          value={activeQuote.clientName}
                          onChange={(e) => handleClientChange("clientName", e.target.value)}
                          className="w-full border-none bg-transparent text-sm text-[#1e293b] font-semibold outline-none focus:outline-none p-0 mt-0.5 placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm relative flex items-center">
                        <Phone className="w-4 h-4 text-[#94a3b8] mr-2 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">Phone Number</span>
                          <input 
                            type="text" 
                            placeholder="+263..."
                            value={activeQuote.clientPhone}
                            onChange={(e) => handleClientChange("clientPhone", e.target.value)}
                            className="w-full border-none bg-transparent text-xs text-[#1e293b] font-semibold outline-none focus:outline-none p-0 mt-0.5 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm relative flex items-center">
                        <Mail className="w-4 h-4 text-[#94a3b8] mr-2 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">Email Address</span>
                          <input 
                            type="email" 
                            placeholder="client@mail.com"
                            value={activeQuote.clientEmail}
                            onChange={(e) => handleClientChange("clientEmail", e.target.value)}
                            className="w-full border-none bg-transparent text-xs text-[#1e293b] font-semibold outline-none focus:outline-none p-0 mt-0.5 placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Materials Dropdown & Selection */}
                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Select Materials Needed</h2>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMaterialDropdownOpen(!isMaterialDropdownOpen)}
                      className="w-full bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-xl py-3.5 px-4 text-sm text-[#1e293b] flex justify-between items-center transition shadow-sm font-semibold select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-[#fb923c]/20 text-[#fb923c] px-2 py-0.5 rounded text-[10px] font-bold">
                          {activeQuote.items.length} Selected
                        </span>
                        <span className="truncate text-slate-700 text-xs font-semibold">
                          {activeQuote.items.length === 0 
                            ? "Tap to select materials..." 
                            : activeQuote.items.map(i => {
                                const m = MATERIALS.find(mat => mat.type === i.material);
                                return m ? m.label : i.material;
                              }).join(", ")
                          }
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMaterialDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown overlay */}
                    <AnimatePresence>
                      {isMaterialDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#f1f5f9]"
                        >
                          {MATERIALS.map((material) => {
                            const isChecked = activeQuote.items.some(item => item.material === material.type);
                            return (
                              <div
                                key={material.type}
                                onClick={() => handleToggleMaterial(material.type)}
                                className="p-3 hover:bg-[#f8fafc] flex items-center gap-3 cursor-pointer select-none transition"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4.5 h-4.5 text-[#fb923c] shrink-0" />
                                ) : (
                                  <Square className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-[#1e293b]">{material.label}</span>
                                    <span className="text-[10px] font-mono text-[#fb923c] font-semibold">${material.defaultPrice} / {material.unit}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{material.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Section C: Item Quantities & Pricing inputs */}
                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Quantities &amp; Pricing</h2>

                  {activeQuote.items.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs space-y-2 shadow-sm">
                      <FileText className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-500">No materials selected yet.</p>
                      <button 
                        type="button"
                        onClick={() => setIsMaterialDropdownOpen(true)}
                        className="text-[#fb923c] hover:text-[#ea580c] underline font-bold cursor-pointer"
                      >
                        Browse &amp; select materials above
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeQuote.items.map((item) => {
                        const materialMeta = MATERIALS.find(m => m.type === item.material);
                        const label = materialMeta ? materialMeta.label : item.material;
                        const unit = materialMeta ? materialMeta.unit : item.unit;

                        return (
                          <div 
                            key={item.id} 
                            className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#fb923c] rounded-xl p-3.5 space-y-3 shadow-sm relative transition"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[#1e293b]">{label}</span>
                              <button 
                                onClick={() => handleToggleMaterial(item.material as MaterialType)}
                                className="text-slate-400 hover:text-red-500 p-1 transition"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="bg-[#f8fafc] border border-slate-200/60 rounded-lg p-2">
                                <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">Quantity ({unit})</span>
                                <div className="flex items-center mt-0.5">
                                  <input 
                                    type="number" 
                                    value={item.quantity === 0 ? "" : item.quantity}
                                    onChange={(e) => handleItemValueChange(item.id, "quantity", Number(e.target.value))}
                                    className="w-full border-none bg-transparent text-xs font-bold font-mono text-[#1e293b] outline-none focus:outline-none p-0"
                                  />
                                  <span className="text-[10px] text-slate-400 font-semibold ml-1 shrink-0">{unit}</span>
                                </div>
                              </div>

                              <div className="bg-[#f8fafc] border border-slate-200/60 rounded-lg p-2">
                                <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">Unit Price ($)</span>
                                <div className="flex items-center mt-0.5">
                                  <span className="text-xs text-slate-400 font-mono mr-1">$</span>
                                  <input 
                                    type="number" 
                                    value={item.unitPrice === 0 ? "" : item.unitPrice}
                                    onChange={(e) => handleItemValueChange(item.id, "unitPrice", Number(e.target.value))}
                                    className="w-full border-none bg-transparent text-xs font-bold font-mono text-[#1e293b] outline-none focus:outline-none p-0"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-100 font-mono text-slate-500">
                              <span>Calculation: {item.quantity || 0} × ${item.unitPrice || 0}</span>
                              <span className="font-semibold text-[#1e3a8a] font-sans">
                                Subtotal: <strong className="font-mono">${item.subtotal.toFixed(2)}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section D: Delivery and Transport */}
                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Delivery &amp; Transport Logistics</h2>

                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-sm space-y-4">
                    {/* Site address details */}
                    <div>
                      <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Specific Site Delivery Address</span>
                      <div className="bg-[#f8fafc] border border-slate-200 rounded-lg py-1 px-3 flex items-center">
                        <MapPin className="w-4 h-4 text-[#fb923c] mr-2 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="e.g. Plot 45, Borrowdale Road, Harare..."
                          value={activeQuote.deliveryAddress}
                          onChange={(e) => handleClientChange("deliveryAddress", e.target.value)}
                          className="w-full bg-transparent border-none text-xs font-semibold text-[#1e293b] placeholder-slate-400 outline-none py-1.5"
                        />
                      </div>
                    </div>

                    {/* Distance input and slider */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Delivery Distance (km)</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={activeQuote.distanceKm}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(300, Number(e.target.value)));
                              handleClientChange("distanceKm", val);
                            }}
                            className="w-16 bg-[#fb923c]/10 text-[#fb923c] text-xs font-mono font-bold px-2 py-0.5 rounded text-center outline-none border-none focus:ring-1 focus:ring-[#fb923c]"
                          />
                          <span className="text-[10px] text-slate-500 font-bold">km</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="150" 
                        value={activeQuote.distanceKm}
                        onChange={(e) => handleClientChange("distanceKm", Number(e.target.value))}
                        className="w-full h-1.5 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#fb923c]"
                      />
                    </div>

                    {/* Auto vs manual override */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label 
                          onClick={() => handleClientChange("useCustomTransport", !activeQuote.useCustomTransport)}
                          className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-[#1e293b]"
                        >
                          {activeQuote.useCustomTransport ? (
                            <CheckSquare className="w-4 h-4 text-[#fb923c]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                          <span>Set custom flat transport cost</span>
                        </label>
                      </div>

                      {activeQuote.useCustomTransport ? (
                        <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[9px] text-[#fb923c] font-bold uppercase tracking-wider block">Custom Transport Amount ($)</span>
                          <div className="relative flex items-center">
                            <span className="text-xs font-mono text-slate-400 mr-1">$</span>
                            <input 
                              type="number" 
                              value={activeQuote.customTransportCost === 0 ? "" : activeQuote.customTransportCost}
                              onChange={(e) => handleClientChange("customTransportCost", Number(e.target.value))}
                              className="w-full bg-transparent border-none text-xs font-bold font-mono text-[#1e293b] outline-none"
                              placeholder="e.g. 200"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[10px] text-slate-500 font-mono flex flex-col gap-1 shadow-sm">
                          <div className="flex justify-between">
                            <span>Base flat fee:</span>
                            <span className="font-semibold text-slate-700">${TRANSPORT_BASE_FEE}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance ({activeQuote.distanceKm} km × ${TRANSPORT_RATE_PER_KM.toFixed(2)}/km):</span>
                            <span className="font-semibold text-slate-700">${(activeQuote.distanceKm * TRANSPORT_RATE_PER_KM).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[#1e3a8a] font-bold border-t border-dashed border-slate-200 pt-1 mt-0.5">
                            <span>Auto total (scaled for weight):</span>
                            <span>${activeQuote.transportCost}</span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Notes textarea */}
                <div>
                  <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Quotation Notes</span>
                  <textarea 
                    value={activeQuote.notes}
                    onChange={(e) => handleClientChange("notes", e.target.value)}
                    placeholder="Enter special site instructions or terms..."
                    rows={2}
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl py-2 px-3 text-xs text-[#1e293b] font-semibold placeholder-slate-400 outline-none resize-none leading-normal shadow-sm"
                  />
                </div>

                {/* Section F: Summary Footer / Actions */}
                <div className="bg-[#1e3a8a] text-white p-5 rounded-2xl shadow-xl space-y-4 border border-white/10">
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-blue-200">
                      <span>Materials Subtotal:</span>
                      <span className="font-semibold">${activeQuote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-200">
                      <span>Transport &amp; Logistics:</span>
                      <span className="font-semibold">${(activeQuote.useCustomTransport ? activeQuote.customTransportCost : activeQuote.transportCost).toFixed(2)}</span>
                    </div>
                    <div className="h-[1px] bg-white/10 my-1"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-sans font-bold">Grand Total:</span>
                      <span className="text-xl font-bold text-[#fb923c]">
                        ${activeQuote.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!activeQuote.clientName.trim()) {
                          alert("Please enter a Client Name before reviewing the preview.");
                          return;
                        }
                        setActiveTab("preview");
                      }}
                      className="bg-white/15 hover:bg-white/20 text-white font-bold py-3 px-3 rounded-xl text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer select-none"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#fb923c]" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveQuotation}
                      className="bg-[#fb923c] hover:bg-[#ea580c] text-white font-bold py-3 px-3 rounded-xl text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer select-none"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save &amp; Record
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 2. PREVIEW TAB */}
            {activeTab === "preview" && (
              <motion.div
                key="preview-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 space-y-5"
              >
                {/* Official Quotation Render */}
                <div className="bg-white text-slate-800 rounded-2xl p-4.5 shadow-md border border-[#e2e8f0] space-y-4 select-none">
                  
                  {/* Company & Header */}
                  <div className="flex justify-between items-start pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CamelonLogo size="sm" showText={false} textColor="dark" />
                      <div>
                        <h3 className="text-sm font-black text-[#1e3a8a] tracking-wider leading-none">CAMELON</h3>
                        <p className="text-[7.5px] uppercase tracking-widest text-slate-500 font-extrabold mt-1">Building Foundations. Delivering Quality.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-[#fb923c]/15 text-[#fb923c] text-[8px] font-bold px-2 py-0.5 rounded">
                        QUOTATION
                      </span>
                      <p className="text-[9px] font-mono font-bold text-slate-600 mt-1">
                        {activeQuote.quoteNumber}
                      </p>
                      <p className="text-[8px] text-slate-400 font-mono">{activeQuote.date}</p>
                    </div>
                  </div>

                  {/* Issuer & Client metadata */}
                  <div className="grid grid-cols-2 gap-3 text-[9px] bg-[#f8fafc] p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 uppercase tracking-widest block text-[7px] font-bold">Issuer</span>
                      <strong className="text-[#1e3a8a] block font-bold">Camelon Depot</strong>
                      <p className="text-slate-500 leading-relaxed">
                        Quarry Site Road<br />Harare, Zimbabwe
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-widest block text-[7px] font-bold">Quotation For</span>
                      <strong className="text-slate-800 block font-bold truncate">{activeQuote.clientName || "Valued Customer"}</strong>
                      <p className="text-slate-500 leading-relaxed truncate">
                        {activeQuote.clientPhone && <span>Ph: {activeQuote.clientPhone}</span>}
                        {activeQuote.deliveryAddress && <span className="block text-[#1e3a8a] font-semibold">Address: {activeQuote.deliveryAddress} ({activeQuote.distanceKm}km)</span>}
                      </p>
                    </div>
                  </div>

                  {/* List items table */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 text-[8px] uppercase font-bold text-[#1e3a8a] pb-1 border-b border-slate-200">
                      <span className="col-span-6">Material</span>
                      <span className="col-span-2 text-center">Price</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Total</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {activeQuote.items.length === 0 ? (
                        <p className="text-center text-slate-400 text-[10px] py-4">No materials selected in this quote.</p>
                      ) : (
                        activeQuote.items.map((item) => {
                          const meta = MATERIALS.find(m => m.type === item.material);
                          const name = meta ? meta.label : item.material;
                          const unit = meta ? meta.unit : item.unit;

                          return (
                            <div key={item.id} className="grid grid-cols-12 text-[10px] py-1.5 text-slate-700 items-center">
                              <div className="col-span-6 font-semibold text-slate-800 truncate">{name}</div>
                              <div className="col-span-2 text-center font-mono text-[9px] text-slate-500">${item.unitPrice}</div>
                              <div className="col-span-2 text-center font-mono text-[9px] text-slate-500">{item.quantity}</div>
                              <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                                ${item.subtotal.toFixed(2)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Materials Subtotal:</span>
                      <span className="font-semibold text-slate-800">${activeQuote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Transport Services ({activeQuote.distanceKm} km):</span>
                      <span className="font-semibold text-slate-800">${(activeQuote.useCustomTransport ? activeQuote.customTransportCost : activeQuote.transportCost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#1e3a8a] text-white p-3 rounded-xl">
                      <span className="text-[10px] uppercase tracking-wider font-bold">Total Balance Due</span>
                      <span className="text-base font-bold font-mono text-[#fb923c]">
                        ${activeQuote.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {activeQuote.notes && (
                    <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200 text-[9px] text-slate-500 italic leading-relaxed">
                      <strong>Site Notes:</strong> "{activeQuote.notes}"
                    </div>
                  )}

                  {/* Settlement conditions */}
                  <div className="text-[8px] text-slate-400 space-y-0.5 leading-normal pt-2 border-t border-slate-100">
                    <p className="font-bold text-slate-500">Corporate Settlement Terms:</p>
                    <p>100% deposit cleared upfront before dispatch. Account: Camelon Trust Bank Acc 1002-394857-901 Branch: Harare CBD. Quotations valid 7 days.</p>
                  </div>
                </div>

                {/* Primary Actions Pane */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="bg-[#fb923c] hover:bg-[#ea580c] text-white font-bold py-3.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1 shadow select-none cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Get PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold py-3.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1 shadow select-none cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      Send &amp; Share
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    Back to edit fields
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === "history" && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Saved History</h2>
                  <button 
                    onClick={handleCreateNewQuotation}
                    className="bg-[#fb923c] hover:bg-[#ea580c] text-white font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition select-none cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Quote
                  </button>
                </div>

                <div className="space-y-3">
                  {savedQuotes.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2 shadow-sm">
                      <List className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold">No saved quotations found.</p>
                      <button 
                        onClick={handleCreateNewQuotation}
                        className="text-[#fb923c] font-bold underline text-xs cursor-pointer"
                      >
                        Create your first quote
                      </button>
                    </div>
                  ) : (
                    savedQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        onClick={() => handleLoadQuotation(quote)}
                        className="bg-white hover:bg-slate-50/50 border border-[#e2e8f0] rounded-xl p-3.5 cursor-pointer relative group transition shadow-sm"
                      >
                        {/* Quote row metadata */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{quote.quoteNumber}</span>
                            <h3 className="text-xs font-bold text-[#1e293b] mt-0.5">{quote.clientName || "Unnamed Client"}</h3>
                            <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[220px]">
                              {quote.items.map(i => {
                                const m = MATERIALS.find(mat => mat.type === i.material);
                                return `${i.quantity}k ${m ? m.label : i.material}`;
                              }).join(", ") || "No items"}
                            </p>
                          </div>
                          
                          <div className="text-right flex flex-col items-end shrink-0">
                            <span className="text-[9px] text-slate-400 font-mono">{quote.date}</span>
                            <span className="text-xs font-bold text-[#fb923c] font-mono mt-0.5">${quote.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Actions block inside item */}
                        <div className="flex justify-between items-center text-[9px] text-[#64748b] mt-2.5 pt-2 border-t border-slate-100 font-mono">
                          <span className="flex items-center gap-1 font-semibold truncate max-w-[140px]">
                            <MapPin className="w-3 h-3 text-[#fb923c] shrink-0" /> {quote.deliveryAddress || "Self collect"}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generateQuotationPDF(quote);
                              }}
                              className="text-white font-bold px-1.5 py-0.5 bg-[#fb923c] rounded hover:bg-[#ea580c] transition text-[8px]"
                              title="Download PDF"
                            >
                              PDF
                            </button>
                            <button
                              onClick={(e) => handleDeleteQuotation(quote.id, e)}
                              className="text-slate-400 hover:text-red-500 p-0.5 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reset defaults */}
                <div className="pt-4 text-center">
                  <button
                    onClick={() => {
                      if (confirm("Reset quotes history back to the initial default Camelon example quotations?")) {
                        setSavedQuotes(INITIAL_QUOTATIONS);
                        alert("Reset complete! Loaded user example quotations.");
                      }
                    }}
                    className="text-slate-400 hover:text-slate-600 text-[10px] font-semibold flex items-center gap-1 mx-auto py-1 px-3 bg-white border border-[#e2e8f0] rounded-lg shadow-sm transition"
                  >
                    <RefreshCw className="w-3 h-3 text-[#fb923c]" /> Restore Default Examples
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. CUSTOMERS TAB */}
            {activeTab === "customers" && (
              <motion.div
                key="customers-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 space-y-4"
              >
                {isCustomerEditing ? (
                  /* CUSTOMER FORM SECTION */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">
                        {editingCustomer ? "Edit Customer" : "Add New Customer"}
                      </h2>
                      <button
                        onClick={() => setIsCustomerEditing(false)}
                        className="text-[10px] text-[#64748b] hover:text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm space-y-3.5">
                      {/* Name input */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center">
                        <User className="w-4 h-4 text-[#94a3b8] mr-2.5 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[9px] text-[#94a3b8] uppercase tracking-wider block font-bold">Full Name</span>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={customerNameInput}
                            onChange={(e) => setCustomerNameInput(e.target.value)}
                            className="w-full border-none bg-transparent text-xs font-semibold text-[#1e293b] outline-none p-0 mt-0.5"
                          />
                        </div>
                      </div>

                      {/* Phone input */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center">
                        <Phone className="w-4 h-4 text-[#94a3b8] mr-2.5 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[9px] text-[#94a3b8] uppercase tracking-wider block font-bold">Phone Number</span>
                          <input
                            type="text"
                            placeholder="+263 77..."
                            value={customerPhoneInput}
                            onChange={(e) => setCustomerPhoneInput(e.target.value)}
                            className="w-full border-none bg-transparent text-xs font-semibold text-[#1e293b] outline-none p-0 mt-0.5"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center">
                        <Mail className="w-4 h-4 text-[#94a3b8] mr-2.5 shrink-0" />
                        <div className="flex-1">
                          <span className="text-[9px] text-[#94a3b8] uppercase tracking-wider block font-bold">Email Address</span>
                          <input
                            type="email"
                            placeholder="customer@email.com"
                            value={customerEmailInput}
                            onChange={(e) => setCustomerEmailInput(e.target.value)}
                            className="w-full border-none bg-transparent text-xs font-semibold text-[#1e293b] outline-none p-0 mt-0.5"
                          />
                        </div>
                      </div>

                      {/* Delivery Street Address text area */}
                      <div>
                        <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Specific Delivery Site Address</span>
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-lg py-1 px-3 flex items-center mb-3">
                          <MapPin className="w-4 h-4 text-[#fb923c] mr-2 shrink-0" />
                          <input 
                            type="text" 
                            placeholder="e.g. Plot 45, Borrowdale Road, Harare..."
                            value={customerAddressInput}
                            onChange={(e) => setCustomerAddressInput(e.target.value)}
                            className="w-full bg-transparent border-none text-xs font-semibold text-[#1e293b] placeholder-slate-400 outline-none py-1.5"
                          />
                        </div>
                      </div>

                      {/* Distance Input and slider */}
                      <div className="space-y-2 pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Delivery Distance (km)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={customerDistanceKm}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(300, Number(e.target.value)));
                                setCustomerDistanceKm(val);
                              }}
                              className="w-16 bg-[#fb923c]/10 text-[#fb923c] text-xs font-mono font-bold px-2 py-0.5 rounded text-center outline-none border-none focus:ring-1 focus:ring-[#fb923c]"
                            />
                            <span className="text-[10px] text-slate-500 font-bold">km</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="150"
                          value={customerDistanceKm}
                          onChange={(e) => setCustomerDistanceKm(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#fb923c]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCustomer}
                      className="w-full bg-[#fb923c] hover:bg-[#ea580c] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Customer Record
                    </button>
                  </div>
                ) : (
                  /* CUSTOMER DIRECTORY LIST SECTION */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Customer Directory</h2>
                      <button
                        onClick={handleStartNewCustomer}
                        className="bg-[#fb923c] hover:bg-[#ea580c] text-white font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition select-none cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Customer
                      </button>
                    </div>

                    <div className="space-y-3">
                      {customers.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2 shadow-sm">
                          <Users className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="text-xs font-semibold">No customers found.</p>
                          <button
                            onClick={handleStartNewCustomer}
                            className="text-[#fb923c] font-bold underline text-xs cursor-pointer"
                          >
                            Create first customer record
                          </button>
                        </div>
                      ) : (
                        customers.map((customer) => {
                          const initials = customer.name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
                          return (
                            <div
                              key={customer.id}
                              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] font-bold text-xs flex items-center justify-center shrink-0">
                                  {initials || "C"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs font-black text-slate-800 truncate">{customer.name}</h3>
                                  <div className="flex flex-col gap-0.5 mt-1">
                                    {customer.phone && (
                                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 font-mono">
                                        <Phone className="w-2.5 h-2.5 text-slate-400" /> {customer.phone}
                                      </span>
                                    )}
                                    {customer.email && (
                                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 font-mono">
                                        <Mail className="w-2.5 h-2.5 text-slate-400" /> {customer.email}
                                      </span>
                                    )}
                                    {customer.deliveryAddress && (
                                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-[#fb923c] shrink-0" />
                                        <span className="truncate">{customer.deliveryAddress} ({customer.distanceKm || 5}km)</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-100 font-semibold">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectCustomer(customer);
                                    setActiveTab("create");
                                  }}
                                  className="text-[#fb923c] hover:text-[#ea580c] transition flex items-center gap-1 cursor-pointer"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" /> Prefill to Quote
                                </button>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditCustomerClick(customer)}
                                    className="text-[#1e3a8a] hover:text-[#172554] transition flex items-center gap-1 cursor-pointer"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3 h-3" /> Edit
                                  </button>
                                  <span className="text-slate-200">|</span>
                                  <button
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                    className="text-red-500 hover:text-red-700 transition flex items-center gap-1 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <div className="bg-white border-t border-[#e2e8f0] py-3 px-6 flex justify-around items-center select-none z-10 shrink-0">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${activeTab === "create" ? "text-[#fb923c] bg-[#fb923c]/5" : "text-slate-400 hover:text-slate-700"}`}
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-display">Builder</span>
          </button>

          <button
            onClick={() => {
              if (!activeQuote.clientName.trim()) {
                alert("Please fill client details first to open preview.");
                return;
              }
              setActiveTab("preview");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${activeTab === "preview" ? "text-[#fb923c] bg-[#fb923c]/5" : "text-slate-400 hover:text-slate-700"}`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-display">Preview</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${activeTab === "history" ? "text-[#fb923c] bg-[#fb923c]/5" : "text-slate-400 hover:text-slate-700"}`}
          >
            <List className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-display">History</span>
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${activeTab === "customers" ? "text-[#fb923c] bg-[#fb923c]/5" : "text-slate-400 hover:text-slate-700"}`}
          >
            <Users className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-display">Customers</span>
          </button>
        </div>

        {/* SUB-MODAL: SEND AND SHARE OPTIONS */}
        <AnimatePresence>
          {isShareModalOpen && (
            <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="w-full max-w-sm bg-white border border-[#e2e8f0] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#172554] px-5 py-4 flex justify-between items-center text-white">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-display flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-[#fb923c]" />
                    Send &amp; Dispatch Quote
                  </h4>
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="text-white/80 hover:text-white font-mono text-xs cursor-pointer select-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4">
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Choose an official dispatch method to transmit this quotation directly to your client.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp */}
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5 transition text-[11px] shadow-sm"
                    >
                      <Send className="w-4.5 h-4.5 rotate-45" />
                      WhatsApp Text
                    </a>

                    {/* Email Client */}
                    <a
                      href={getEmailLink()}
                      className="bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5 transition text-[11px] shadow-sm"
                    >
                      <Mail className="w-4.5 h-4.5" />
                      Email Client
                    </a>
                  </div>

                  {/* Simulate sending direct email */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e293b]">
                      <Sparkles className="w-3.5 h-3.5 text-[#fb923c]" />
                      Simulate Direct PDF Email
                    </div>

                    <form onSubmit={handleSimulateSend} className="space-y-2">
                      <input 
                        type="email" 
                        placeholder="Enter Client Email..."
                        value={sendToEmail}
                        onChange={(e) => setSendToEmail(e.target.value)}
                        required
                        className="w-full bg-[#f8fafc] border border-slate-250 focus:border-[#fb923c] rounded-xl py-2 px-3 text-xs text-slate-800 outline-none"
                      />

                      <button
                        type="submit"
                        disabled={simulatedSendStatus !== "idle"}
                        className={`w-full font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-sm ${
                          simulatedSendStatus === "sending" 
                            ? "bg-slate-100 text-slate-400" 
                            : simulatedSendStatus === "success"
                            ? "bg-emerald-500 text-white"
                            : "bg-[#fb923c] hover:bg-[#ea580c] text-white"
                        }`}
                      >
                        {simulatedSendStatus === "sending" ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Transmitting PDF...
                          </>
                        ) : simulatedSendStatus === "success" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Sent Successfully!
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Simulate Send Email
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
