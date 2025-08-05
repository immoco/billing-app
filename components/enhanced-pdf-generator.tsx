"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceItem {
  id: string
  name: string
  description?: string
  hsn?: string
  quantity: number
  rate: number
  discount: number
  tax: number
  amount: number
  taxAmount: number
  finalAmount: number
}

interface Customer {
  id: number
  name: string
  email?: string
  phone: string
  gst?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  customerType: "B2B" | "B2C"
}

interface GSTBreakdown {
  cgst: number
  sgst: number
  igst: number
  totalGst: number
}

interface DocumentData {
  documentNumber: string
  type:
    | "invoice"
    | "quotation"
    | "purchase_order"
    | "sales_order"
    | "receipt"
    | "delivery_note"
    | "credit_note"
    | "debit_note"
  date: Date
  dueDate: Date
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  discount: number
  gstBreakdown: GSTBreakdown
  grandTotal: number
  paymentMode?: string
  notes?: string
}

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  gst: string
  website?: string
  logo?: string
  pan?: string
  cin?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    ifscCode: string
    branch: string
  }
}

export class GSTRulesEngine {
  static calculateGST(amount: number, customerState: string, companyState = "Maharashtra"): GSTBreakdown {
    const gstRate = 0.18 // 18% GST rate
    const totalGst = amount * gstRate

    if (customerState === companyState) {
      // Intra-state: CGST + SGST
      return {
        cgst: totalGst / 2,
        sgst: totalGst / 2,
        igst: 0,
        totalGst,
      }
    } else {
      // Inter-state: IGST
      return {
        cgst: 0,
        sgst: 0,
        igst: totalGst,
        totalGst,
      }
    }
  }

  static validateGSTNumber(gstNumber: string): boolean {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstRegex.test(gstNumber)
  }

  static getStateFromGST(gstNumber: string): string {
    const stateCode = gstNumber.substring(0, 2)
    const stateCodes: { [key: string]: string } = {
      "01": "Jammu and Kashmir",
      "02": "Himachal Pradesh",
      "03": "Punjab",
      "04": "Chandigarh",
      "05": "Uttarakhand",
      "06": "Haryana",
      "07": "Delhi",
      "08": "Rajasthan",
      "09": "Uttar Pradesh",
      "10": "Bihar",
      "11": "Sikkim",
      "12": "Arunachal Pradesh",
      "13": "Nagaland",
      "14": "Manipur",
      "15": "Mizoram",
      "16": "Tripura",
      "17": "Meghalaya",
      "18": "Assam",
      "19": "West Bengal",
      "20": "Jharkhand",
      "21": "Odisha",
      "22": "Chhattisgarh",
      "23": "Madhya Pradesh",
      "24": "Gujarat",
      "25": "Daman and Diu",
      "26": "Dadra and Nagar Haveli",
      "27": "Maharashtra",
      "28": "Andhra Pradesh",
      "29": "Karnataka",
      "30": "Goa",
      "31": "Lakshadweep",
      "32": "Kerala",
      "33": "Tamil Nadu",
      "34": "Puducherry",
      "35": "Andaman and Nicobar Islands",
      "36": "Telangana",
      "37": "Andhra Pradesh",
    }
    return stateCodes[stateCode] || "Unknown"
  }
}

export class EnhancedPDFGenerator {
  private doc: jsPDF
  private company: CompanyInfo
  private template: "professional" | "modern" | "minimal" | "detailed" | "gst_compliant" | "government"

  constructor(
    company?: CompanyInfo,
    template: "professional" | "modern" | "minimal" | "detailed" | "gst_compliant" | "government" = "professional",
  ) {
    this.doc = new jsPDF()
    this.template = template
    this.company = company || {
      name: "BizManager Pro",
      address: "123 Business Street, City, State - 400001",
      phone: "+91 9876543210",
      email: "contact@company.com",
      gst: "27ABCDE1234F1Z5",
      website: "www.bizmanager.com",
      pan: "ABCDE1234F",
      cin: "U12345MH2020PTC123456",
      bankDetails: {
        bankName: "State Bank of India",
        accountNumber: "1234567890",
        ifscCode: "SBIN0001234",
        branch: "Mumbai Main Branch",
      },
    }
  }

  generateDocument(documentData: DocumentData, output: "download" | "blob" = "download"): void | Blob {
    this.doc = new jsPDF()

    switch (this.template) {
      case "professional":
        this.generateProfessionalTemplate(documentData)
        break
      case "modern":
        this.generateModernTemplate(documentData)
        break
      case "minimal":
        this.generateMinimalTemplate(documentData)
        break
      case "detailed":
        this.generateDetailedTemplate(documentData)
        break
      case "gst_compliant":
        this.generateGSTCompliantTemplate(documentData)
        break
      case "government":
        this.generateGovernmentTemplate(documentData)
        break
    }

    if (output === "download") {
      this.doc.save(`${this.getDocumentTitle(documentData.type)}-${documentData.documentNumber}.pdf`)
    } else {
      return this.doc.output("blob")
    }
  }

  private getDocumentTitle(type: string): string {
    switch (type) {
      case "invoice":
        return "Tax Invoice"
      case "quotation":
        return "Quotation"
      case "purchase_order":
        return "Purchase Order"
      case "sales_order":
        return "Sales Order"
      case "receipt":
        return "Receipt"
      case "delivery_note":
        return "Delivery Note"
      case "credit_note":
        return "Credit Note"
      case "debit_note":
        return "Debit Note"
      default:
        return "Document"
    }
  }

  private getDocumentDisplayTitle(type: string): string {
    switch (type) {
      case "invoice":
        return "TAX INVOICE"
      case "quotation":
        return "QUOTATION"
      case "purchase_order":
        return "PURCHASE ORDER"
      case "sales_order":
        return "SALES ORDER"
      case "receipt":
        return "RECEIPT"
      case "delivery_note":
        return "DELIVERY NOTE"
      case "credit_note":
        return "CREDIT NOTE"
      case "debit_note":
        return "DEBIT NOTE"
      default:
        return "DOCUMENT"
    }
  }

  // GST Compliant Template (Based on GST Rules)
  private generateGSTCompliantTemplate(documentData: DocumentData): void {
    // Header with GST compliance
    this.addGSTCompliantHeader(documentData)

    // Document title and details
    this.addGSTDocumentTitle(documentData)

    // Customer details with GST format
    this.addGSTCustomerDetails(documentData.customer)

    // Items table with HSN codes
    this.addGSTItemsTable(documentData.items)

    // GST breakdown and totals
    this.addGSTTotalsSection(documentData)

    // GST compliant footer
    this.addGSTCompliantFooter(documentData)
  }

  // Government Style Template
  private generateGovernmentTemplate(documentData: DocumentData): void {
    // Government style header
    this.addGovernmentHeader(documentData)

    // Document details
    this.addGovernmentDocumentDetails(documentData)

    // Customer section
    this.addGovernmentCustomerSection(documentData.customer)

    // Items table
    this.addGovernmentItemsTable(documentData.items)

    // Totals section
    this.addGovernmentTotalsSection(documentData)

    // Government footer
    this.addGovernmentFooter(documentData)
  }

  private addGSTCompliantHeader(documentData: DocumentData): void {
    // Company logo and details
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(0, 0, 210, 50, "F")

    // Company logo placeholder
    this.doc.setFillColor(41, 128, 185)
    this.doc.rect(15, 10, 20, 20, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("LOGO", 20, 25)

    // Company details
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 40, 20)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(this.company.address, 40, 27)
    this.doc.text(`Phone: ${this.company.phone} | Email: ${this.company.email}`, 40, 32)

    // GST and other compliance details
    this.doc.text(`GSTIN: ${this.company.gst}`, 40, 37)
    if (this.company.pan) {
      this.doc.text(`PAN: ${this.company.pan}`, 40, 42)
    }
    if (this.company.cin) {
      this.doc.text(`CIN: ${this.company.cin}`, 120, 42)
    }

    // Document type badge
    const docTitle = this.getDocumentDisplayTitle(documentData.type)
    this.doc.setFillColor(220, 53, 69)
    this.doc.rect(150, 10, 45, 15, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(docTitle, 172.5, 20, { align: "center" })

    // Border
    this.doc.setDrawColor(0, 0, 0)
    this.doc.setLineWidth(0.5)
    this.doc.rect(10, 5, 190, 45)
  }

  private addGSTDocumentTitle(documentData: DocumentData): void {
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(16)
    this.doc.setFont("helvetica", "bold")

    const title = this.getDocumentDisplayTitle(documentData.type)
    this.doc.text(title, 105, 65, { align: "center" })

    // Document details in a box
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(10, 70, 90, 25)
    this.doc.rect(105, 70, 95, 25)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    // Left side - Document details
    const prefix = this.getDocumentPrefix(documentData.type)
    this.doc.text(`${prefix} No: ${documentData.documentNumber}`, 15, 80)
    this.doc.text(`Date: ${documentData.date.toLocaleDateString("en-IN")}`, 15, 86)

    if (documentData.type === "invoice") {
      this.doc.text(`Due Date: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 15, 92)
    } else if (documentData.type === "quotation") {
      this.doc.text(`Valid Till: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 15, 92)
    }

    // Right side - Additional details
    this.doc.text(`State Code: 27 (Maharashtra)`, 110, 80)
    if (documentData.paymentMode) {
      this.doc.text(`Payment Mode: ${documentData.paymentMode}`, 110, 86)
    }
    this.doc.text(`Place of Supply: Maharashtra`, 110, 92)
  }

  private addGSTCustomerDetails(customer: Customer): void {
    // Customer details box
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(10, 100, 95, 45)
    this.doc.rect(110, 100, 90, 45)

    // Bill To
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("BILL TO:", 15, 110)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(9)
    this.doc.text(customer.name, 15, 118)

    if (customer.address) {
      const addressLines = this.doc.splitTextToSize(
        `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
        80,
      )
      this.doc.text(addressLines, 15, 124)
    }

    this.doc.text(`Phone: ${customer.phone}`, 15, 135)
    if (customer.email) {
      this.doc.text(`Email: ${customer.email}`, 15, 140)
    }

    // Ship To / GST Details
    this.doc.setFont("helvetica", "bold")
    this.doc.text("SHIP TO:", 115, 110)

    this.doc.setFont("helvetica", "normal")
    if (customer.gst) {
      this.doc.text(`GSTIN: ${customer.gst}`, 115, 118)
      this.doc.text(`State: ${customer.state}`, 115, 124)
      this.doc.text(`Customer Type: ${customer.customerType}`, 115, 130)
    } else {
      this.doc.text("Same as billing address", 115, 118)
      this.doc.text(`State: ${customer.state}`, 115, 124)
      this.doc.text("Unregistered Customer", 115, 130)
    }
  }

  private addGSTItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item, index) => [
      (index + 1).toString(),
      `${item.name}\n${item.description || ""}`,
      item.hsn || "N/A",
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      item.discount > 0 ? `${item.discount}%` : "0%",
      `₹${item.amount.toFixed(2)}`,
      `${item.tax}%`,
      `₹${item.taxAmount.toFixed(2)}`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 150,
      head: [
        [
          "S.No",
          "Description of Goods/Services",
          "HSN/SAC",
          "Qty",
          "Rate",
          "Disc",
          "Taxable Value",
          "Tax Rate",
          "Tax Amount",
          "Total Amount",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 40, halign: "left" },
        2: { halign: "center", cellWidth: 18 },
        3: { halign: "center", cellWidth: 12 },
        4: { halign: "right", cellWidth: 18 },
        5: { halign: "center", cellWidth: 12 },
        6: { halign: "right", cellWidth: 20 },
        7: { halign: "center", cellWidth: 15 },
        8: { halign: "right", cellWidth: 18 },
        9: { halign: "right", cellWidth: 22 },
      },
    })
  }

  private addGSTTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 200

    // Totals section with GST breakdown
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(120, finalY + 10, 80, 70)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    let yPos = finalY + 18

    // Subtotal
    this.doc.text("Subtotal:", 125, yPos)
    this.doc.text(`₹${documentData.subtotal.toFixed(2)}`, 195, yPos, { align: "right" })

    // Discount
    if (documentData.discount > 0) {
      yPos += 6
      this.doc.text("Discount:", 125, yPos)
      this.doc.text(`-₹${documentData.discount.toFixed(2)}`, 195, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Taxable Amount:", 125, yPos)
    this.doc.text(`₹${(documentData.subtotal - documentData.discount).toFixed(2)}`, 195, yPos, { align: "right" })

    // GST breakdown
    if (documentData.gstBreakdown.cgst > 0) {
      yPos += 6
      this.doc.text("CGST @ 9%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.cgst.toFixed(2)}`, 195, yPos, { align: "right" })

      yPos += 6
      this.doc.text("SGST @ 9%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.sgst.toFixed(2)}`, 195, yPos, { align: "right" })
    } else {
      yPos += 6
      this.doc.text("IGST @ 18%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.igst.toFixed(2)}`, 195, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Total Tax Amount:", 125, yPos)
    this.doc.text(`₹${documentData.gstBreakdown.totalGst.toFixed(2)}`, 195, yPos, { align: "right" })

    // Grand total with border
    yPos += 8
    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(125, yPos - 2, 195, yPos - 2)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.text("Grand Total:", 125, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 195, yPos, { align: "right" })

    // Amount in words
    yPos += 8
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    const amountInWords = this.convertNumberToWords(Math.round(documentData.grandTotal))
    this.doc.text("Amount in Words:", 125, yPos)
    const wordsLines = this.doc.splitTextToSize(amountInWords, 70)
    this.doc.text(wordsLines, 125, yPos + 4)

    // Tax summary box (left side)
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(10, finalY + 10, 105, 35)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("TAX SUMMARY", 15, finalY + 20)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.text(`Taxable Amount: ₹${(documentData.subtotal - documentData.discount).toFixed(2)}`, 15, finalY + 28)
    this.doc.text(`Total Tax: ₹${documentData.gstBreakdown.totalGst.toFixed(2)}`, 15, finalY + 34)
    this.doc.text(`Total Amount: ₹${documentData.grandTotal.toFixed(2)}`, 15, finalY + 40)
  }

  private addGSTCompliantFooter(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY + 90

    // Bank details section
    if (this.company.bankDetails) {
      this.doc.setDrawColor(0, 0, 0)
      this.doc.rect(10, finalY, 95, 30)

      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(10)
      this.doc.text("BANK DETAILS", 15, finalY + 8)

      this.doc.setFont("helvetica", "normal")
      this.doc.setFontSize(8)
      this.doc.text(`Bank: ${this.company.bankDetails.bankName}`, 15, finalY + 15)
      this.doc.text(`A/c No: ${this.company.bankDetails.accountNumber}`, 15, finalY + 20)
      this.doc.text(`IFSC: ${this.company.bankDetails.ifscCode}`, 15, finalY + 25)
    }

    // Signature section
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(110, finalY, 90, 30)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("FOR " + this.company.name.toUpperCase(), 115, finalY + 8)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.text("Authorized Signatory", 115, finalY + 25)

    // Terms and conditions
    const termsY = finalY + 35
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.text("Terms & Conditions:", 10, termsY)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(7)

    if (documentData.type === "invoice") {
      this.doc.text("1. Payment is due within 30 days of invoice date", 10, termsY + 6)
      this.doc.text("2. Interest @ 24% per annum will be charged on overdue amounts", 10, termsY + 10)
      this.doc.text("3. All disputes subject to Mumbai jurisdiction only", 10, termsY + 14)
      this.doc.text("4. This is a computer generated invoice and does not require physical signature", 10, termsY + 18)
    } else if (documentData.type === "quotation") {
      this.doc.text("1. This quotation is valid for 30 days from the date of issue", 10, termsY + 6)
      this.doc.text("2. Prices are subject to change without prior notice", 10, termsY + 10)
      this.doc.text("3. Payment terms: 50% advance, balance on delivery", 10, termsY + 14)
    }

    // Footer
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(7)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 10, 285)
    this.doc.text("This is a computer generated document", 150, 285)
  }

  // Government Template Methods
  private addGovernmentHeader(documentData: DocumentData): void {
    // Government style header with emblem placeholder
    this.doc.setFillColor(255, 255, 255)
    this.doc.rect(0, 0, 210, 60, "F")

    // Government emblem placeholder
    this.doc.setFillColor(255, 153, 0)
    this.doc.circle(105, 25, 15, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("GOVT", 105, 28, { align: "center" })

    // Company details centered
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(16)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 105, 45, { align: "center" })

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(this.company.address, 105, 52, { align: "center" })

    // Border
    this.doc.setDrawColor(0, 0, 0)
    this.doc.setLineWidth(1)
    this.doc.rect(5, 5, 200, 55)
    this.doc.rect(7, 7, 196, 51)
  }

  private addGovernmentDocumentDetails(documentData: DocumentData): void {
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)

    const title = this.getDocumentDisplayTitle(documentData.type)
    this.doc.text(title, 105, 75, { align: "center" })

    // Document details table
    this.doc.setDrawColor(0, 0, 0)
    this.doc.setLineWidth(0.5)

    // Create a formal table for document details
    const detailsY = 85
    this.doc.rect(20, detailsY, 170, 25)
    this.doc.line(105, detailsY, 105, detailsY + 25)
    this.doc.line(20, detailsY + 12.5, 190, detailsY + 12.5)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    this.doc.text(`Document No: ${documentData.documentNumber}`, 25, detailsY + 8)
    this.doc.text(`Date: ${documentData.date.toLocaleDateString("en-IN")}`, 110, detailsY + 8)
    this.doc.text(`Reference: ${documentData.type.toUpperCase()}`, 25, detailsY + 20)
    this.doc.text(`Valid Till: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 110, detailsY + 20)
  }

  private addGovernmentCustomerSection(customer: Customer): void {
    const startY = 120

    // Customer details in government format
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(20, startY, 170, 40)
    this.doc.line(105, startY, 105, startY + 40)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("PARTY DETAILS", 25, startY + 10)
    this.doc.text("DELIVERY DETAILS", 110, startY + 10)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(9)

    // Left side - Party details
    this.doc.text(`Name: ${customer.name}`, 25, startY + 18)
    this.doc.text(`Phone: ${customer.phone}`, 25, startY + 24)
    if (customer.gst) {
      this.doc.text(`GSTIN: ${customer.gst}`, 25, startY + 30)
    }
    this.doc.text(`Type: ${customer.customerType}`, 25, startY + 36)

    // Right side - Delivery details
    if (customer.address) {
      const addressLines = this.doc.splitTextToSize(
        `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
        75,
      )
      this.doc.text(addressLines, 110, startY + 18)
    } else {
      this.doc.text("Same as party address", 110, startY + 18)
    }
  }

  private addGovernmentItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.description || "",
      item.hsn || "N/A",
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 170,
      head: [["Sr. No.", "Particulars", "Description", "HSN Code", "Quantity", "Rate", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 20 },
        1: { cellWidth: 50, halign: "left" },
        2: { cellWidth: 40, halign: "left" },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "center", cellWidth: 25 },
        5: { halign: "right", cellWidth: 25 },
        6: { halign: "right", cellWidth: 25 },
      },
    })
  }

  private addGovernmentTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 220

    // Government style totals
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(130, finalY + 10, 60, 40)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    let yPos = finalY + 18
    this.doc.text("Subtotal:", 135, yPos)
    this.doc.text(`₹${documentData.subtotal.toFixed(2)}`, 185, yPos, { align: "right" })

    if (documentData.discount > 0) {
      yPos += 6
      this.doc.text("Discount:", 135, yPos)
      this.doc.text(`₹${documentData.discount.toFixed(2)}`, 185, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Tax Amount:", 135, yPos)
    this.doc.text(`₹${documentData.gstBreakdown.totalGst.toFixed(2)}`, 185, yPos, { align: "right" })

    yPos += 8
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.text("Total:", 135, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 185, yPos, { align: "right" })
  }

  private addGovernmentFooter(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY + 60

    // Official seal and signature section
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(20, finalY, 80, 35)
    this.doc.rect(110, finalY, 80, 35)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("RECEIVED BY", 25, finalY + 10)
    this.doc.text("ISSUED BY", 115, finalY + 10)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.text("Name: ________________", 25, finalY + 20)
    this.doc.text("Date: ________________", 25, finalY + 26)
    this.doc.text("Signature: ____________", 25, finalY + 32)

    this.doc.text("Authorized Officer", 115, finalY + 20)
    this.doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 115, finalY + 26)
    this.doc.text("Official Seal & Signature", 115, finalY + 32)

    // Footer note
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(7)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text("This is an official document generated by the system", 105, 285, { align: "center" })
  }

  // Existing template methods (keeping them for backward compatibility)
  private generateProfessionalTemplate(documentData: DocumentData): void {
    this.addProfessionalHeader(documentData)
    this.addDocumentTitle(documentData)
    this.addCustomerDetails(documentData.customer)
    this.addItemsTable(documentData.items)
    this.addTotalsSection(documentData)
    this.addProfessionalFooter(documentData)
  }

  private generateModernTemplate(documentData: DocumentData): void {
    this.doc.setFillColor(45, 55, 72)
    this.doc.rect(0, 0, 210, 40, "F")

    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 20, 25)

    this.doc.setTextColor(0, 0, 0)
    this.addModernDocumentDetails(documentData)
    this.addCustomerDetails(documentData.customer, 50)
    this.addModernItemsTable(documentData.items)
    this.addModernTotalsSection(documentData)
    this.addModernFooter(documentData)
  }

  private generateMinimalTemplate(documentData: DocumentData): void {
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 20, 20)

    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(20, 25, 190, 25)

    this.addMinimalDocumentDetails(documentData)
    this.addCustomerDetails(documentData.customer, 40)
    this.addMinimalItemsTable(documentData.items)
    this.addMinimalTotalsSection(documentData)
  }

  private generateDetailedTemplate(documentData: DocumentData): void {
    this.addDetailedHeader()
    this.addDetailedDocumentInfo(documentData)
    this.addDetailedCustomerSection(documentData.customer)
    this.addDetailedItemsTable(documentData.items)
    this.addDetailedTotalsSection(documentData)
    this.addDetailedFooter(documentData)
  }

  // Helper methods (keeping existing ones and adding new)
  private getDocumentPrefix(type: string): string {
    switch (type) {
      case "invoice":
        return "INV"
      case "quotation":
        return "QUO"
      case "purchase_order":
        return "PO"
      case "sales_order":
        return "SO"
      case "receipt":
        return "REC"
      case "delivery_note":
        return "DN"
      case "credit_note":
        return "CN"
      case "debit_note":
        return "DB"
      default:
        return "DOC"
    }
  }

  // Keep all existing methods for backward compatibility
  private addProfessionalHeader(documentData: DocumentData): void {
    this.doc.setFillColor(41, 128, 185)
    this.doc.rect(20, 10, 15, 15, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("LOGO", 23, 21)

    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 40, 20)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(this.company.address, 40, 27)
    this.doc.text(`Phone: ${this.company.phone} | Email: ${this.company.email}`, 40, 32)
    this.doc.text(`GST: ${this.company.gst}`, 40, 37)

    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(20, 45, 190, 45)
  }

  private addDocumentTitle(documentData: DocumentData): void {
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(41, 128, 185)

    const title = this.getDocumentDisplayTitle(documentData.type)
    this.doc.text(title, 20, 58)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.setTextColor(0, 0, 0)

    const prefix = this.getDocumentPrefix(documentData.type)
    this.doc.text(`${prefix} No: ${documentData.documentNumber}`, 20, 70)
    this.doc.text(`Date: ${documentData.date.toLocaleDateString("en-IN")}`, 20, 76)

    if (documentData.type === "invoice") {
      this.doc.text(`Due Date: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 20, 82)
      if (documentData.paymentMode) {
        this.doc.text(`Payment Mode: ${documentData.paymentMode}`, 20, 88)
      }
    } else if (documentData.type === "quotation") {
      this.doc.text(`Valid Till: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 20, 82)
    }
  }

  private addCustomerDetails(customer: Customer, startY = 65): void {
    this.doc.setDrawColor(200, 200, 200)
    this.doc.rect(120, startY, 70, 40)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("Bill To:", 125, startY + 7)

    this.doc.setFont("helvetica", "normal")
    this.doc.text(customer.name, 125, startY + 14)

    if (customer.gst) {
      this.doc.text(`GST: ${customer.gst}`, 125, startY + 20)
    }

    this.doc.text(customer.phone, 125, startY + 26)

    if (customer.email) {
      this.doc.text(customer.email, 125, startY + 32)
    }

    if (customer.address) {
      const addressLines = this.doc.splitTextToSize(
        `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
        65,
      )
      this.doc.text(addressLines, 125, startY + 38)
    }
  }

  private addItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item, index) => [
      (index + 1).toString(),
      `${item.name}\n${item.description || ""}${item.hsn ? `\nHSN: ${item.hsn}` : ""}`,
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      item.discount > 0 ? `${item.discount}%` : "-",
      `${item.tax}%`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 115,
      head: [["S.No", "Item Description", "Qty", "Rate", "Disc%", "Tax%", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 60, halign: "left" },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", cellWidth: 25 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 20 },
        6: { halign: "right", cellWidth: 30 },
      },
    })
  }

  private addTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 180

    this.doc.setDrawColor(200, 200, 200)
    this.doc.rect(120, finalY + 10, 70, 50)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    let yPos = finalY + 18

    this.doc.text("Subtotal:", 125, yPos)
    this.doc.text(`₹${documentData.subtotal.toFixed(2)}`, 185, yPos, { align: "right" })

    if (documentData.discount > 0) {
      yPos += 6
      this.doc.text("Discount:", 125, yPos)
      this.doc.text(`-₹${documentData.discount.toFixed(2)}`, 185, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Taxable Amount:", 125, yPos)
    this.doc.text(`₹${(documentData.subtotal - documentData.discount).toFixed(2)}`, 185, yPos, { align: "right" })

    if (documentData.gstBreakdown.cgst > 0) {
      yPos += 6
      this.doc.text("CGST:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.cgst.toFixed(2)}`, 185, yPos, { align: "right" })

      yPos += 6
      this.doc.text("SGST:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.sgst.toFixed(2)}`, 185, yPos, { align: "right" })
    } else {
      yPos += 6
      this.doc.text("IGST:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.igst.toFixed(2)}`, 185, yPos, { align: "right" })
    }

    yPos += 8
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(11)
    this.doc.text("Grand Total:", 125, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 185, yPos, { align: "right" })

    yPos += 8
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    const amountInWords = this.convertNumberToWords(Math.round(documentData.grandTotal))
    this.doc.text("Amount in Words:", 125, yPos)
    const wordsLines = this.doc.splitTextToSize(amountInWords, 60)
    this.doc.text(wordsLines, 125, yPos + 4)
  }

  private addProfessionalFooter(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 180

    if (documentData.notes) {
      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(10)
      this.doc.text("Notes:", 20, finalY + 75)

      this.doc.setFont("helvetica", "normal")
      this.doc.setFontSize(9)
      const splitNotes = this.doc.splitTextToSize(documentData.notes, 170)
      this.doc.text(splitNotes, 20, finalY + 81)
    }

    const termsY = finalY + 95
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.text("Terms & Conditions:", 20, termsY)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)

    if (documentData.type === "invoice") {
      this.doc.text("1. Payment is due within 30 days of invoice date", 20, termsY + 6)
      this.doc.text("2. Interest @ 24% per annum will be charged on overdue amounts", 20, termsY + 10)
      this.doc.text("3. Subject to local jurisdiction only", 20, termsY + 14)
    } else if (documentData.type === "quotation") {
      this.doc.text("1. This quotation is valid for 30 days from the date of issue", 20, termsY + 6)
      this.doc.text("2. Prices are subject to change without prior notice", 20, termsY + 10)
      this.doc.text("3. Payment terms: 50% advance, balance on delivery", 20, termsY + 14)
    }

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.setTextColor(41, 128, 185)
    const thankYouMessage =
      documentData.type === "invoice" ? "Thank you for your business!" : "We look forward to your business!"
    this.doc.text(thankYouMessage, 20, termsY + 25)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 20, 285)
    this.doc.text("Page 1 of 1", 170, 285)
  }

  // Add remaining existing methods for other templates...
  private addModernDocumentDetails(documentData: DocumentData): void {
    this.doc.setFontSize(16)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(45, 55, 72)

    const title = this.getDocumentDisplayTitle(documentData.type)
    this.doc.text(title, 140, 25)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`#${documentData.documentNumber}`, 140, 32)
    this.doc.text(documentData.date.toLocaleDateString("en-IN"), 140, 37)
  }

  private addModernItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item) => [
      item.name,
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 100,
      head: [["Item", "Qty", "Rate", "Amount"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [45, 55, 72],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 6,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    })
  }

  private addModernTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 150

    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(45, 55, 72)
    this.doc.text(`Total: ₹${documentData.grandTotal.toFixed(2)}`, 140, finalY + 20)
  }

  private addModernFooter(documentData: DocumentData): void {
    this.doc.setFillColor(45, 55, 72)
    this.doc.rect(0, 270, 210, 27, "F")

    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(8)
    this.doc.text(this.company.email, 20, 280)
    this.doc.text(this.company.phone, 20, 285)
  }

  private addMinimalDocumentDetails(documentData: DocumentData): void {
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")

    const title = this.getDocumentTitle(documentData.type)
    this.doc.text(`${title} #${documentData.documentNumber}`, 20, 35)
    this.doc.text(documentData.date.toLocaleDateString("en-IN"), 140, 35)
  }

  private addMinimalItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item) => [
      item.name,
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 90,
      head: [["Item", "Qty", "Rate", "Total"]],
      body: tableData,
      theme: "plain",
      styles: {
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    })
  }

  private addMinimalTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 150

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(`Total: ₹${documentData.grandTotal.toFixed(2)}`, 140, finalY + 10)
  }

  private addDetailedHeader(): void {
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 20, 20)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(this.company.address, 20, 28)
    this.doc.text(`Phone: ${this.company.phone}`, 20, 34)
    this.doc.text(`Email: ${this.company.email}`, 20, 40)
    this.doc.text(`GST: ${this.company.gst}`, 20, 46)
    if (this.company.website) {
      this.doc.text(`Website: ${this.company.website}`, 20, 52)
    }
  }

  private addDetailedDocumentInfo(documentData: DocumentData): void {
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(120, 15, 70, 35)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(14)
    const title = this.getDocumentDisplayTitle(documentData.type)
    this.doc.text(title, 125, 25)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)
    this.doc.text(`Number: ${documentData.documentNumber}`, 125, 32)
    this.doc.text(`Date: ${documentData.date.toLocaleDateString("en-IN")}`, 125, 38)
    this.doc.text(`Due: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 125, 44)
  }

  private addDetailedCustomerSection(customer: Customer): void {
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(20, 60, 85, 40)
    this.doc.rect(110, 60, 80, 40)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("BILL TO:", 25, 70)

    this.doc.setFont("helvetica", "normal")
    this.doc.text(customer.name, 25, 78)
    if (customer.address) {
      this.doc.text(customer.address, 25, 84)
      this.doc.text(`${customer.city}, ${customer.state} - ${customer.pincode}`, 25, 90)
    }
    this.doc.text(`Phone: ${customer.phone}`, 25, 96)

    this.doc.setFont("helvetica", "bold")
    this.doc.text("SHIP TO:", 115, 70)

    this.doc.setFont("helvetica", "normal")
    this.doc.text("Same as billing address", 115, 78)

    if (customer.gst) {
      this.doc.text(`GST: ${customer.gst}`, 115, 84)
    }
    this.doc.text(`Type: ${customer.customerType}`, 115, 90)
  }

  private addDetailedItemsTable(items: InvoiceItem[]): void {
    const tableData = items.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.description || "",
      item.hsn || "",
      item.quantity.toString(),
      `₹${item.rate.toFixed(2)}`,
      item.discount > 0 ? `${item.discount}%` : "0%",
      `₹${item.amount.toFixed(2)}`,
      `₹${item.taxAmount.toFixed(2)}`,
      `₹${item.finalAmount.toFixed(2)}`,
    ])

    autoTable(this.doc, {
      startY: 110,
      head: [["#", "Item", "Description", "HSN", "Qty", "Rate", "Disc", "Amount", "Tax", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 30, halign: "left" },
        2: { cellWidth: 25, halign: "left" },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "center", cellWidth: 12 },
        5: { halign: "right", cellWidth: 20 },
        6: { halign: "center", cellWidth: 12 },
        7: { halign: "right", cellWidth: 20 },
        8: { halign: "right", cellWidth: 18 },
        9: { halign: "right", cellWidth: 22 },
      },
    })
  }

  private addDetailedTotalsSection(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 180

    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(120, finalY + 10, 70, 65)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    let yPos = finalY + 18
    this.doc.text("Subtotal:", 125, yPos)
    this.doc.text(`₹${documentData.subtotal.toFixed(2)}`, 185, yPos, { align: "right" })

    if (documentData.discount > 0) {
      yPos += 6
      this.doc.text("Discount:", 125, yPos)
      this.doc.text(`-₹${documentData.discount.toFixed(2)}`, 185, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Taxable Amount:", 125, yPos)
    this.doc.text(`₹${(documentData.subtotal - documentData.discount).toFixed(2)}`, 185, yPos, { align: "right" })

    if (documentData.gstBreakdown.cgst > 0) {
      yPos += 6
      this.doc.text("CGST @ 9%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.cgst.toFixed(2)}`, 185, yPos, { align: "right" })

      yPos += 6
      this.doc.text("SGST @ 9%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.sgst.toFixed(2)}`, 185, yPos, { align: "right" })
    } else {
      yPos += 6
      this.doc.text("IGST @ 18%:", 125, yPos)
      this.doc.text(`₹${documentData.gstBreakdown.igst.toFixed(2)}`, 185, yPos, { align: "right" })
    }

    yPos += 6
    this.doc.text("Total GST:", 125, yPos)
    this.doc.text(`₹${documentData.gstBreakdown.totalGst.toFixed(2)}`, 185, yPos, { align: "right" })

    yPos += 10
    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(125, yPos - 2, 185, yPos - 2)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.text("Grand Total:", 125, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 185, yPos, { align: "right" })
  }

  private addDetailedFooter(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY + 80

    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(20, finalY, 80, 30)
    this.doc.rect(110, finalY, 80, 30)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("Customer Signature", 25, finalY + 8)
    this.doc.text("Authorized Signatory", 115, finalY + 8)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.text("Date: ___________", 25, finalY + 25)
    this.doc.text("Date: ___________", 115, finalY + 25)

    this.doc.text("Company Seal & Signature", 115, finalY + 15)

    const termsY = finalY + 40
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.text("Terms & Conditions:", 20, termsY)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(7)

    if (documentData.type === "invoice") {
      this.doc.text("1. Payment is due within 30 days of invoice date", 20, termsY + 6)
      this.doc.text("2. Interest @ 24% per annum will be charged on overdue amounts", 20, termsY + 10)
      this.doc.text("3. All disputes subject to local jurisdiction only", 20, termsY + 14)
      this.doc.text("4. Goods once sold will not be taken back", 20, termsY + 18)
    } else {
      this.doc.text("1. This quotation is valid for 30 days from the date of issue", 20, termsY + 6)
      this.doc.text("2. Prices are subject to change without prior notice", 20, termsY + 10)
      this.doc.text("3. Payment terms: 50% advance, balance on delivery", 20, termsY + 14)
      this.doc.text("4. Delivery charges extra if applicable", 20, termsY + 18)
    }

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 20, 285)
    this.doc.text("This is a computer generated document", 120, 285)
  }

  static generateDocumentNumber(prefix = "INV"): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `${prefix}-${timestamp.toString().slice(-6)}${random.toString().padStart(3, "0")}`
  }

  private convertNumberToWords(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if (amount === 0) return "Zero Rupees Only"

    const crores = Math.floor(amount / 10000000)
    const lakhs = Math.floor((amount % 10000000) / 100000)
    const thousands = Math.floor((amount % 100000) / 1000)
    const hundreds = Math.floor((amount % 1000) / 100)
    const remainder = amount % 100

    let result = ""

    if (crores > 0) {
      result += this.convertTwoDigits(crores) + " Crore "
    }

    if (lakhs > 0) {
      result += this.convertTwoDigits(lakhs) + " Lakh "
    }

    if (thousands > 0) {
      result += this.convertTwoDigits(thousands) + " Thousand "
    }

    if (hundreds > 0) {
      result += ones[hundreds] + " Hundred "
    }

    if (remainder > 0) {
      result += this.convertTwoDigits(remainder) + " "
    }

    return result.trim() + " Rupees Only"
  }

  private convertTwoDigits(num: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if (num < 10) {
      return ones[num]
    } else if (num < 20) {
      return teens[num - 10]
    } else {
      return tens[Math.floor(num / 10)] + (num % 10 > 0 ? " " + ones[num % 10] : "")
    }
  }
}

// Export the enhanced PDF generator as the default
export const PDFGenerator = EnhancedPDFGenerator
