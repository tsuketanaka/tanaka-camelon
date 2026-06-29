import { jsPDF } from "jspdf";
import { Quotation } from "../types";
import { MATERIALS } from "../data";

export function generateQuotationPDF(quote: Quotation) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const primaryBlue = [30, 58, 138]; // #1E3A8A
  const accentOrange = [249, 115, 22]; // #F97316
  const textDark = [31, 41, 55]; // #1F2937
  const textLight = [107, 114, 128]; // #6B7280
  const bgLight = [243, 244, 246]; // #F3F4F6

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = 15;

  // Helper functions
  const drawLine = (y: number, thickness = 0.2, color = [229, 231, 235]) => {
    doc.setLineWidth(thickness);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const drawHeader = () => {
    // Top Accent Bar
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, pageWidth, 6, "F");

    doc.setFillColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.rect(0, 6, pageWidth, 2, "F");

    currentY = 20;

    // Draw the C emblem (top-left)
    const logoX = margin;
    const logoY = currentY - 5;
    
    // Draw orange top arc of 'C'
    doc.setDrawColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.setLineWidth(1.8);
    // Draw top semicircle/arc
    doc.line(logoX, logoY + 4, logoX, logoY + 1.5);
    doc.line(logoX, logoY + 1.5, logoX + 4, logoY);
    doc.line(logoX + 4, logoY, logoX + 8, logoY + 1.5);
    doc.line(logoX + 8, logoY + 1.5, logoX + 8, logoY + 3);
    
    // Draw dark blue bottom arc of 'C'
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(1.8);
    doc.line(logoX, logoY + 4, logoX, logoY + 6.5);
    doc.line(logoX, logoY + 6.5, logoX + 4, logoY + 8);
    doc.line(logoX + 4, logoY + 8, logoX + 8, logoY + 6.5);
    doc.line(logoX + 8, logoY + 6.5, logoX + 8, logoY + 5);

    // Draw minimalist camel head dot inside
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.circle(logoX + 4.5, logoY + 3.8, 1.2, "F");

    // Company Name with trademark A triangle accent
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("C", logoX + 13, currentY);
    doc.text("AMELON", logoX + 20, currentY);

    // Draw tiny orange triangle inside the "A" (which resides at logoX + 20)
    doc.setFillColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.triangle(
      logoX + 23.3, currentY - 1.2,
      logoX + 22.1, currentY + 0.8,
      logoX + 24.5, currentY + 0.8,
      "F"
    );

    // Dynamic tagline flanking lines matching the logo image perfectly
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text("BUILDING FOUNDATIONS. DELIVERING QUALITY.", logoX + 13, currentY + 5);

    // Draw tiny orange accent line under the tagline
    doc.setDrawColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.setLineWidth(0.4);
    doc.line(logoX + 13, currentY + 7, logoX + 85, currentY + 7);

    // Document Title (Right-aligned)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("OFFICIAL QUOTATION", pageWidth - margin - 75, currentY - 1);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(`Quote Ref: ${quote.quoteNumber}`, pageWidth - margin - 75, currentY + 4);
    doc.text(`Date: ${quote.date}`, pageWidth - margin - 75, currentY + 8);

    currentY += 15;
    drawLine(currentY, 0.5, primaryBlue);
    currentY += 6;
  };

  const drawCompanyDetails = () => {
    // Company contact details left, Client details right
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("From:", margin, currentY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text([
      "Phone: +263783776204",
      "Phone: +263783017072",
      "Email: leomuchenje@gmail.com"
    ], margin, currentY + 4);

    // Client section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("Quotation For:", pageWidth / 2 + 5, currentY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text([
      quote.clientName || "Valued Customer",
      quote.clientPhone ? `Phone: ${quote.clientPhone}` : "Phone: N/A",
      quote.clientEmail ? `Email: ${quote.clientEmail}` : "Email: N/A",
      `Delivery Site: ${quote.deliveryAddress || "Self Collection"}`,
      `Est. Distance: ${quote.distanceKm} km`
    ], pageWidth / 2 + 5, currentY + 4);

    currentY += 28;
    drawLine(currentY, 0.2);
    currentY += 6;
  };

  const drawItemsTable = () => {
    // Table Header Background
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 8, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255); // White
    
    // Headers text
    doc.text("Material Description", margin + 3, currentY + 5.5);
    doc.text("Unit Price", margin + 80, currentY + 5.5);
    doc.text("Quantity", margin + 115, currentY + 5.5);
    doc.text("Subtotal", pageWidth - margin - 25, currentY + 5.5, { align: "right" });

    currentY += 8;

    // Table Rows
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    
    quote.items.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 8, "F");
      }

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      // Look up human-friendly material name
      const materialMeta = MATERIALS.find(m => m.type === item.material);
      const name = materialMeta ? materialMeta.label : item.material;
      const unit = materialMeta ? materialMeta.unit : item.unit;

      doc.text(name, margin + 3, currentY + 5.5);
      doc.text(`$${item.unitPrice.toFixed(2)} per ${unit}`, margin + 80, currentY + 5.5);
      doc.text(`${item.quantity} ${unit}`, margin + 115, currentY + 5.5);
      
      doc.setFont("Helvetica", "bold");
      doc.text(`$${item.subtotal.toFixed(2)}`, pageWidth - margin - 5, currentY + 5.5, { align: "right" });
      doc.setFont("Helvetica", "normal");

      currentY += 8;
    });

    // Materials Subtotal Row
    drawLine(currentY, 0.2);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Materials Subtotal:", margin + 115, currentY + 5.5);
    doc.text(`$${quote.subtotal.toFixed(2)}`, pageWidth - margin - 5, currentY + 5.5, { align: "right" });
    
    currentY += 8;

    // Transport Row
    const transportLabel = `Transport Logistics (${quote.distanceKm} km)`;
    doc.setFont("Helvetica", "normal");
    doc.text(transportLabel, margin + 3, currentY + 5.5);
    doc.setFont("Helvetica", "bold");
    doc.text(`$${quote.transportCost.toFixed(2)}`, pageWidth - margin - 5, currentY + 5.5, { align: "right" });
    
    currentY += 8;
    drawLine(currentY, 0.5, primaryBlue);
    currentY += 4;

    // Grand Total box
    doc.setFillColor(accentOrange[0], accentOrange[1], accentOrange[2]);
    doc.rect(pageWidth - margin - 80, currentY, 80, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Total Balance Due:", pageWidth - margin - 75, currentY + 6.5);
    doc.text(`$${quote.total.toFixed(2)}`, pageWidth - margin - 5, currentY + 6.5, { align: "right" });

    currentY += 16;
  };

  const drawFooter = () => {
    // Authorized Signature
    const sigY = pageHeight - 35;
    doc.setDrawColor(textLight[0], textLight[1], textLight[2]);
    doc.setLineWidth(0.2);
    doc.line(pageWidth - margin - 50, sigY, pageWidth - margin, sigY);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text("Authorized Signature", pageWidth - margin - 25, sigY + 4, { align: "center" });
    doc.text("Camelon Logistics Dept.", pageWidth - margin - 25, sigY + 8, { align: "center" });

    // Page footer
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text("Thank you for doing business with Camelon. Your construction partner.", pageWidth / 2, pageHeight - 10, { align: "center" });
  };

  // Run PDF building
  drawHeader();
  drawCompanyDetails();
  drawItemsTable();
  drawFooter();

  // Save the document
  const fileName = `Camelon_Quotation_${quote.quoteNumber.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
  return fileName;
}
