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
  type: "invoice" | "quotation"
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

export class PDFGenerator {
  private doc: jsPDF
  private company: CompanyInfo
  private template: "professional" | "modern" | "minimal" | "detailed"

  constructor(company?: CompanyInfo, template: "professional" | "modern" | "minimal" | "detailed" = "professional") {
    this.doc = new jsPDF()
    this.template = template
    this.company = company || {
      name: "BizManager Pro",
      address: "123 Business Street, City, State - 400001",
      phone: "+91 9876543210",
      email: "contact@company.com",
      gst: "27ABCDE1234F1Z5",
      website: "www.bizmanager.com",
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
    }

    if (output === "download") {
      this.doc.save(`${documentData.type}-${documentData.documentNumber}.pdf`)
    } else {
      return this.doc.output("blob")
    }
  }

  private generateProfessionalTemplate(documentData: DocumentData): void {
    // Header with company info
    this.addProfessionalHeader()

    // Document title and details
    this.addDocumentTitle(documentData)

    // Customer details
    this.addCustomerDetails(documentData.customer)

    // Items table
    this.addItemsTable(documentData.items)

    // Totals and GST breakdown
    this.addTotalsSection(documentData)

    // Footer
    this.addProfessionalFooter(documentData)
  }

  private generateModernTemplate(documentData: DocumentData): void {
    // Modern header with gradient-like effect
    this.doc.setFillColor(45, 55, 72)
    this.doc.rect(0, 0, 210, 40, "F")

    // Company name in white
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 20, 25)

    // Reset color for rest of document
    this.doc.setTextColor(0, 0, 0)

    // Document details with modern styling
    this.addModernDocumentDetails(documentData)
    this.addCustomerDetails(documentData.customer, 50)
    this.addModernItemsTable(documentData.items)
    this.addModernTotalsSection(documentData)
    this.addModernFooter(documentData)
  }

  private generateMinimalTemplate(documentData: DocumentData): void {
    // Minimal header - just company name
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 20, 20)

    // Simple line separator
    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(20, 25, 190, 25)

    // Minimal document details
    this.addMinimalDocumentDetails(documentData)
    this.addCustomerDetails(documentData.customer, 40)
    this.addMinimalItemsTable(documentData.items)
    this.addMinimalTotalsSection(documentData)
  }

  private generateDetailedTemplate(documentData: DocumentData): void {
    // Detailed header with all company information
    this.addDetailedHeader()
    this.addDetailedDocumentInfo(documentData)
    this.addDetailedCustomerSection(documentData.customer)
    this.addDetailedItemsTable(documentData.items)
    this.addDetailedTotalsSection(documentData)
    this.addDetailedFooter(documentData)
  }

  private addProfessionalHeader(): void {
    // Company logo placeholder
    this.doc.setFillColor(41, 128, 185)
    this.doc.rect(20, 10, 15, 15, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("LOGO", 23, 21)

    // Company details
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(this.company.name, 40, 20)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(this.company.address, 40, 27)
    this.doc.text(`Phone: ${this.company.phone} | Email: ${this.company.email}`, 40, 32)
    this.doc.text(`GST: ${this.company.gst}`, 40, 37)

    // Separator line
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(20, 45, 190, 45)
  }

  private addDocumentTitle(documentData: DocumentData): void {
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(41, 128, 185)

    const title = documentData.type === "invoice" ? "TAX INVOICE" : "QUOTATION"
    this.doc.text(title, 20, 58)

    // Document details
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.setTextColor(0, 0, 0)

    const prefix = documentData.type === "invoice" ? "Invoice" : "Quotation"
    this.doc.text(`${prefix} No: ${documentData.documentNumber}`, 20, 70)
    this.doc.text(`Date: ${documentData.date.toLocaleDateString("en-IN")}`, 20, 76)

    if (documentData.type === "invoice") {
      this.doc.text(`Due Date: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 20, 82)
      if (documentData.paymentMode) {
        this.doc.text(`Payment Mode: ${documentData.paymentMode}`, 20, 88)
      }
    } else {
      this.doc.text(`Valid Till: ${documentData.dueDate.toLocaleDateString("en-IN")}`, 20, 82)
    }
  }

  private addCustomerDetails(customer: Customer, startY = 65): void {
    // Customer details box
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

    // Totals box
    this.doc.setDrawColor(200, 200, 200)
    this.doc.rect(120, finalY + 10, 70, 50)

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    let yPos = finalY + 18

    // Left aligned labels, right aligned values
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

    // GST breakdown
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

    // Grand total
    yPos += 8
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(11)
    this.doc.text("Grand Total:", 125, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 185, yPos, { align: "right" })

    // Amount in words
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

    // Notes section
    if (documentData.notes) {
      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(10)
      this.doc.text("Notes:", 20, finalY + 75)

      this.doc.setFont("helvetica", "normal")
      this.doc.setFontSize(9)
      const splitNotes = this.doc.splitTextToSize(documentData.notes, 170)
      this.doc.text(splitNotes, 20, finalY + 81)
    }

    // Terms and conditions
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
    } else {
      this.doc.text("1. This quotation is valid for 30 days from the date of issue", 20, termsY + 6)
      this.doc.text("2. Prices are subject to change without prior notice", 20, termsY + 10)
      this.doc.text("3. Payment terms: 50% advance, balance on delivery", 20, termsY + 14)
    }

    // Thank you message
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.setTextColor(41, 128, 185)
    const thankYouMessage =
      documentData.type === "invoice" ? "Thank you for your business!" : "We look forward to your business!"
    this.doc.text(thankYouMessage, 20, termsY + 25)

    // Footer
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 20, 285)
    this.doc.text("Page 1 of 1", 170, 285)
  }

  // Modern template methods
  private addModernDocumentDetails(documentData: DocumentData): void {
    this.doc.setFontSize(16)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(45, 55, 72)

    const title = documentData.type === "invoice" ? "INVOICE" : "QUOTATION"
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

  // Minimal template methods
  private addMinimalDocumentDetails(documentData: DocumentData): void {
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")

    const title = documentData.type === "invoice" ? "Invoice" : "Quotation"
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

  // Detailed template methods
  private addDetailedHeader(): void {
    // Detailed company information
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
    const title = documentData.type === "invoice" ? "TAX INVOICE" : "QUOTATION"
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

    // Bill To
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

    // Ship To (same as Bill To for now)
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

    // Detailed totals with all breakdowns
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

    // Detailed GST breakdown
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

    // Grand total with border
    yPos += 10
    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(125, yPos - 2, 185, yPos - 2)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.text("Grand Total:", 125, yPos)
    this.doc.text(`₹${documentData.grandTotal.toFixed(2)}`, 185, yPos, { align: "right" })
  }

  private addDetailedFooter(documentData: DocumentData): void {
    const finalY = (this.doc as any).lastAutoTable?.finalY || 180

    // Signature section
    this.doc.setDrawColor(0, 0, 0)
    this.doc.rect(20, finalY + 85, 80, 30)
    this.doc.rect(110, finalY + 85, 80, 30)

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.text("Customer Signature", 25, finalY + 93)
    this.doc.text("Authorized Signatory", 115, finalY + 93)

    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.text("Date: ___________", 25, finalY + 110)
    this.doc.text("Date: ___________", 115, finalY + 110)

    // Company stamp area
    this.doc.text("Company Seal & Signature", 115, finalY + 100)

    // Terms and conditions
    const termsY = finalY + 125
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

    // Footer
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
