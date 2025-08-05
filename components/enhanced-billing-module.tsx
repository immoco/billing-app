"use client"

import type React from "react"
import type { Customer, Product } from "@/types"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Minus,
  Download,
  Send,
  Calculator,
  Search,
  X,
  Eye,
  Save,
  Copy,
  Edit,
  FileText,
  Package,
  ShoppingCart,
  Receipt,
  CreditCard,
} from "lucide-react"
import { PDFGenerator, GSTRulesEngine } from "@/components/fixed-pdf-generator"
import PDFPreviewModal from "@/components/pdf-preview-modal"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { EnhancedPDFGenerator } from "@/components/enhanced-pdf-generator"

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

interface Document {
  id: string
  documentNumber: string
  type: "invoice" | "quotation" | "purchase_order" | "sales_order" | "receipt"
  date: Date
  dueDate: Date
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  discount: number
  grandTotal: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paymentMode?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface DocumentData {
      documentNumber: string
      type: "invoice" | "quotation" | "purchase_order" | "sales_order" | "receipt"
      date: Date
      dueDate: Date
      customer: Customer
      items: InvoiceItem[]
      subtotal: number
      discount: number
      gstBreakdown: { cgst: number; sgst: number; igst: number; totalGst: number }
      grandTotal: number
      paymentMode: string
      notes: string
}

interface PaymentRecord {
  id: string
  invoiceNumber: string
  partyName: string
  partyType: "customer" | "supplier"
  dueDate: Date
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  paymentHistory: []
  createdAt: Date
}


export default function EnhancedBillingModule() {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("create")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false)
  const [previewPDFUrl, setPreviewPDFUrl] = useState<string>("")
  const [documentType, setDocumentType] = useState<
    "invoice" | "quotation" | "purchase_order" | "sales_order" | "receipt"
  >("invoice")
  const [paymentMode, setPaymentMode] = useState("")
  const [notes, setNotes] = useState("")
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage")
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [documentFilter, setDocumentFilter] = useState<
    "all" | "invoice" | "quotation" | "purchase_order" | "sales_order" | "receipt"
  >("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent" | "paid" | "overdue" | "cancelled">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [pdfTemplate, setPdfTemplate] = useState<
    "professional" | "modern" | "minimal" | "detailed" | "gst_compliant" | "government"
  >("professional")

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);


  useEffect(() => {
    fetch("/api/customers").then(res => res.json()).then(setCustomers);
    fetch("/api/products").then(res => res.json()).then(setProducts);
  }, []);

  console.log(customers);
  console.log(products);

  // const [customers, setCustomers] = useState<Customer[]>([
  //   {
  //     id: 1,
  //     name: "Tech Solutions Ltd",
  //     gst: "29ABCDE1234F1Z5",
  //     phone: "+91 9876543210",
  //     email: "contact@techsolutions.com",
  //     address: "123 Business Park",
  //     city: "Mumbai",
  //     state: "Maharashtra",
  //     pincode: "400001",
  //     customerType: "B2B",
  //   },
  //   {
  //     id: 2,
  //     name: "ABC Enterprises",
  //     gst: "27FGHIJ5678K2L6",
  //     phone: "+91 9876543211",
  //     email: "info@abcenterprises.com",
  //     address: "456 Industrial Area",
  //     city: "Delhi",
  //     state: "Delhi",
  //     pincode: "110001",
  //     customerType: "B2B",
  //   },
  //   {
  //     id: 3,
  //     name: "John Doe",
  //     phone: "+91 9876543212",
  //     email: "john@example.com",
  //     address: "789 Residential Area",
  //     city: "Bangalore",
  //     state: "Karnataka",
  //     pincode: "560001",
  //     customerType: "B2C",
  //   },
  // ])

  // const [products, setProducts] = useState<Product[]>([
  //   {
  //     id: 1,
  //     name: "Dell Latitude 7420",
  //     description: "Business Laptop with Intel i7 processor",
  //     category: "Laptops",
  //     brand: "Dell",
  //     sku: "DL7420",
  //     hsn: "84713000",
  //     rate: 45000,
  //     tax: 18,
  //     stock: 15,
  //     minStock: 5,
  //     costPrice: 38000,
  //     sellingPrice: 45000,
  //     status: "active",
  //     supplier: "Dell India",
  //     barcode: "1234567890123",
  //   },
  //   {
  //     id: 2,
  //     name: "HP EliteBook 840",
  //     description: "Professional Laptop for business use",
  //     category: "Laptops",
  //     brand: "HP",
  //     sku: "HP840",
  //     hsn: "84713000",
  //     rate: 38000,
  //     tax: 18,
  //     stock: 8,
  //     minStock: 3,
  //     costPrice: 32000,
  //     sellingPrice: 38000,
  //     status: "active",
  //     supplier: "HP India",
  //     barcode: "1234567890124",
  //   },
  //   {
  //     id: 3,
  //     name: "MacBook Air M1",
  //     description: "Apple Silicon M1 chip laptop",
  //     category: "Laptops",
  //     brand: "Apple",
  //     sku: "MBA-M1",
  //     hsn: "84713000",
  //     rate: 85000,
  //     tax: 18,
  //     stock: 5,
  //     minStock: 2,
  //     costPrice: 75000,
  //     sellingPrice: 85000,
  //     status: "active",
  //     supplier: "Apple India",
  //     barcode: "1234567890125",
  //   },
  //   {
  //     id: 4,
  //     name: "Laptop Bag",
  //     description: "Protective laptop carrying case",
  //     category: "Accessories",
  //     brand: "Generic",
  //     sku: "LB001",
  //     hsn: "42021200",
  //     rate: 2000,
  //     tax: 18,
  //     stock: 25,
  //     minStock: 10,
  //     costPrice: 1500,
  //     sellingPrice: 2000,
  //     status: "active",
  //     supplier: "Local Supplier",
  //     barcode: "1234567890126",
  //   },
  //   {
  //     id: 5,
  //     name: "Wireless Mouse",
  //     description: "Bluetooth wireless mouse",
  //     category: "Accessories",
  //     brand: "Logitech",
  //     sku: "WM001",
  //     hsn: "84716070",
  //     rate: 1500,
  //     tax: 18,
  //     stock: 50,
  //     minStock: 20,
  //     costPrice: 1200,
  //     sellingPrice: 1500,
  //     status: "active",
  //     supplier: "Logitech India",
  //     barcode: "1234567890127",
  //   },
  // ])

  // Load documents from localStorage on component mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem("documents")
    if (savedDocuments) {
      const parsedDocuments = JSON.parse(savedDocuments).map((doc: Document) => ({
        ...doc,
        date: new Date(doc.date),
        dueDate: new Date(doc.dueDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }))
      setDocuments(parsedDocuments)
    }
  }, [])

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents

    if (documentFilter !== "all") {
      filtered = filtered.filter((doc) => doc.type === documentFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredDocuments(filtered)
  }, [documents, documentFilter, statusFilter, searchTerm])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      tax: 18,
      amount: 0,
      taxAmount: 0,
      finalAmount: 0,
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number | null | undefined) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Recalculate amounts when quantity, rate, discount, or tax changes
          if (["quantity", "rate", "discount", "tax"].includes(field)) {
            const baseAmount = updatedItem.quantity * updatedItem.rate
            const discountAmount = (baseAmount * updatedItem.discount) / 100
            updatedItem.amount = baseAmount - discountAmount
            updatedItem.taxAmount = (updatedItem.amount * updatedItem.tax) / 100
            updatedItem.finalAmount = updatedItem.amount + updatedItem.taxAmount
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const addCustomer = (customerData: Omit<Customer, "id">) => {
    // In production, you should POST to /api/customers and refetch
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
    }
    setCustomers([...customers, newCustomer])
    setSelectedCustomer(newCustomer)
    setCustomerSearch(newCustomer.name || "")
    setIsAddCustomerOpen(false)
  }

  // Calculate totals with GST rules
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  const totalDiscount = discount > 0 ? (discountType === "percentage" ? (subtotal * discount) / 100 : discount) : 0
  const discountedSubtotal = subtotal - totalDiscount

  // Apply GST rules based on customer and company location
  const gstCalculation = selectedCustomer
    ? GSTRulesEngine.calculateGST(discountedSubtotal, selectedCustomer.state || "", "Maharashtra")
    : { cgst: 0, sgst: 0, igst: 0, totalGst: 0 }

  const grandTotal = discountedSubtotal + gstCalculation.totalGst

  const saveDocument = (status: "draft" | "sent" = "draft") => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add items before saving.",
        variant: "destructive",
      })
      return
    }

    const documentData: Document = {
      id: editingDocument?.id || Date.now().toString(),
      documentNumber:
        editingDocument?.documentNumber || PDFGenerator.generateDocumentNumber(getDocumentPrefix(documentType)),
      type: documentType,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: selectedCustomer,
      items: invoiceItems,
      subtotal,
      discount: totalDiscount,
      grandTotal,
      status,
      paymentMode,
      notes,
      createdAt: editingDocument?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    let updatedDocuments
    if (editingDocument) {
      updatedDocuments = documents.map((doc) => (doc.id === editingDocument.id ? documentData : doc))
    } else {
      updatedDocuments = [...documents, documentData]
    }

    setDocuments(updatedDocuments)
    localStorage.setItem("documents", JSON.stringify(updatedDocuments))

    // Create payment record for invoices and receipts
    if (documentType === "invoice" || documentType === "receipt") {
      const paymentRecord = {
        id: documentData.id,
        invoiceNumber: documentData.documentNumber,
        partyName: selectedCustomer.name,
        partyType: "customer" as const,
        dueDate: documentData.dueDate,
        originalAmount: grandTotal,
        paidAmount: documentType === "receipt" ? grandTotal : 0,
        remainingAmount: documentType === "receipt" ? 0 : grandTotal,
        status:
          documentType === "receipt"
            ? ("paid" as const)
            : status === "sent"
              ? ("pending" as const)
              : ("draft" as const),
        paymentHistory:
          documentType === "receipt"
            ? [
                {
                  id: Date.now().toString(),
                  date: new Date(),
                  amount: grandTotal,
                  mode: (paymentMode as string) || "cash",
                  reference: documentData.documentNumber,
                  notes: "Payment recorded with receipt",
                },
              ]
            : [],
        createdAt: new Date(),
      }

      // Save to payment records
      const existingPayments = JSON.parse(localStorage.getItem("paymentRecords") || "[]")
      const updatedPayments = editingDocument
        ? existingPayments.map((p: PaymentRecord) => (p.id === documentData.id ? paymentRecord : p))
        : [...existingPayments, paymentRecord]

      localStorage.setItem("paymentRecords", JSON.stringify(updatedPayments))
    }

    toast({
      title: "Document Saved",
      description: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} saved successfully as ${status}.`,
    })

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setInvoiceItems([])
    setSelectedCustomer(null)
    setCustomerSearch("")
    setPaymentMode("")
    setNotes("")
    setDiscount(0)
    setEditingDocument(null)
  }

  const editDocument = (doc: Document) => {
    setEditingDocument(doc)
    setDocumentType(doc.type)
    setSelectedCustomer(doc.customer)
    setCustomerSearch(doc.customer.name)
    setInvoiceItems(doc.items)
    setPaymentMode(doc.paymentMode || "")
    setNotes(doc.notes || "")
    setDiscount(doc.discount)
    setActiveTab("create")
  }

  const duplicateDocument = (doc: Document) => {
    setDocumentType(doc.type)
    setSelectedCustomer(doc.customer)
    setCustomerSearch(doc.customer.name)
    setInvoiceItems(doc.items.map((item) => ({ ...item, id: Date.now().toString() + Math.random() })))
    setPaymentMode(doc.paymentMode || "")
    setNotes(doc.notes || "")
    setDiscount(doc.discount)
    setActiveTab("create")

    toast({
      title: "Document Duplicated",
      description: "Document has been duplicated. You can now modify and save it.",
    })
  }

  const deleteDocument = (id: string) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== id)
    setDocuments(updatedDocuments)
    localStorage.setItem("documents", JSON.stringify(updatedDocuments))

    toast({
      title: "Document Deleted",
      description: "Document has been deleted successfully.",
    })
  }

  const generatePDF = async (
    type: "invoice" | "quotation" | "purchase_order" | "sales_order" | "receipt",
    preview = false,
    existingDoc?: Document,
    template: "professional" | "modern" | "minimal" | "detailed" | "gst_compliant" | "government" = "professional",
  ) => {
    const docData = existingDoc || {
      customer: selectedCustomer,
      items: invoiceItems,
      subtotal,
      discount: totalDiscount,
      grandTotal,
      paymentMode,
      notes,
    }

    if (!docData.customer || (!existingDoc && invoiceItems.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add items before generating document.",
        variant: "destructive",
      })
      return
    }

    const documentData = {
      documentNumber:
        existingDoc?.documentNumber || EnhancedPDFGenerator.generateDocumentNumber(getDocumentPrefix(type)),
      type,
      date: existingDoc?.date || new Date(),
      dueDate: existingDoc?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: docData.customer,
      items: existingDoc?.items || invoiceItems,
      subtotal: docData.subtotal,
      discount: docData.discount,
      gstBreakdown: GSTRulesEngine.calculateGST(
        docData.subtotal - docData.discount,
        docData.customer.state || "",
        "Maharashtra",
      ),
      grandTotal: docData.grandTotal,
      paymentMode: docData.paymentMode,
      notes: docData.notes,
    };

    const generator = new EnhancedPDFGenerator(undefined, template)

    if (preview) {
      const pdfBlob = generator.generateDocument(documentData as any, "blob")
      const pdfUrl = URL.createObjectURL(pdfBlob as Blob)
      setPreviewPDFUrl(pdfUrl)
      setIsPDFPreviewOpen(true)
    } else {
      generator.generateDocument(documentData as any, "download")
    }
  }

  const getDocumentPrefix = (type: string) => {
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
      default:
        return "DOC"
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />
      case "quotation":
        return <Calculator className="h-4 w-4" />
      case "purchase_order":
        return <Package className="h-4 w-4" />
      case "sales_order":
        return <ShoppingCart className="h-4 w-4" />
      case "receipt":
        return <Receipt className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "sent":
        return "default"
      case "paid":
        return "default"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(customerSearch.toLowerCase()) || (customer.phone || "").includes(customerSearch),
  )

  const filteredProducts = products.filter((product) => product.status === "active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
        <div className="flex space-x-2">
          <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="quotation">Quotation</SelectItem>
              <SelectItem value="purchase_order">Purchase Order</SelectItem>
              <SelectItem value="sales_order">Sales Order</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Document</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Details</CardTitle>
                    <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Customer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                          <DialogDescription>Enter customer details</DialogDescription>
                        </DialogHeader>
                        <AddCustomerForm onAdd={addCustomer} onClose={() => setIsAddCustomerOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="customer">Search Customer</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customer"
                        placeholder="Type customer name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {customerSearch && !selectedCustomer && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setCustomerSearch(customer.name || "")
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                {customer.gst_number && <p className="text-xs text-muted-foreground">GST: {customer.gst_number}</p>}
                              </div>
                              <Badge variant={customer.customerType === "B2B" ? "default" : "secondary"}>
                                {customer.customerType || ""}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedCustomer && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{selectedCustomer.name}</p>
                            <Badge variant={selectedCustomer.customerType === "B2B" ? "default" : "secondary"}>
                              {selectedCustomer.customerType || ""}
                            </Badge>
                          </div>
                          {selectedCustomer.gst_number && (
                            <p className="text-sm text-muted-foreground">GST: {selectedCustomer.gst_number}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Phone: {selectedCustomer.phone}</p>
                          {selectedCustomer.email && (
                            <p className="text-sm text-muted-foreground">Email: {selectedCustomer.email}</p>
                          )}
                          {selectedCustomer.address && (
                            <p className="text-sm text-muted-foreground">
                              {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.pincode].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null)
                            setCustomerSearch("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button onClick={addItem} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoiceItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                        <div className="col-span-3">
                          <Label>Product/Service</Label>
                          <div className="space-y-2">
                            <Select
                              value={item.name || ""}
                              onValueChange={(value) => {
                                if (value === "custom") {
                                  updateItem(item.id, "name", "")
                                  updateItem(item.id, "description", "")
                                  updateItem(item.id, "hsn", "")
                                  updateItem(item.id, "rate", 0)
                                  updateItem(item.id, "tax", 18)
                                  return
                                }

                                const product = filteredProducts.find((p) => p.name === value)
                                if (product) {
                                  updateItem(item.id, "name", product.name)
                                  updateItem(item.id, "description", product.description)
                                  updateItem(item.id, "hsn", product.hsn)
                                  updateItem(item.id, "rate", product.sellingPrice ?? 0)
                                  updateItem(item.id, "tax", product.tax)
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                <SelectItem value="custom">
                                  <div className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Custom Product
                                  </div>
                                </SelectItem>
                                {filteredProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.name}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.description}</p>
                                        <div className="flex items-center space-x-2 text-xs">
                                          <span className="text-green-600">Stock: {product.stock}</span>
                                          <span className="text-blue-600">HSN: {product.hsn}</span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <p className="font-medium">₹{product.sellingPrice?.toLocaleString() || "0"}</p>
                                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {(!item.name || item.name === "") && (
                              <Input
                                placeholder="Enter custom product name"
                                value={item.name || ""}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label>HSN Code</Label>
                          <Input
                            value={item.hsn}
                            onChange={(e) => updateItem(item.id, "hsn", e.target.value)}
                            placeholder="HSN Code"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Rate</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Disc%</Label>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Tax%</Label>
                          <Input
                            type="number"
                            value={item.tax}
                            onChange={(e) => updateItem(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Amount</Label>
                          <Input value={`₹${item.finalAmount.toLocaleString()}`} readOnly className="bg-muted" />
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {invoiceItems.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No items added. Click "Add Item" to start.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary and Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-₹{totalDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Taxable Amount:</span>
                      <span>₹{discountedSubtotal.toLocaleString()}</span>
                    </div>

                    {selectedCustomer?.state === "Maharashtra" ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>CGST:</span>
                          <span>₹{gstCalculation.cgst.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>SGST:</span>
                          <span>₹{gstCalculation.sgst.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span>IGST:</span>
                        <span>₹{gstCalculation.igst.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total:</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Discount</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <Select
                        value={discountType}
                        onValueChange={(value: "percentage" | "amount") => setDiscountType(value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="amount">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(documentType === "invoice" || documentType === "receipt") && (
                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <Label>PDF Template</Label>
                    <Select value={pdfTemplate} onValueChange={(value) => setPdfTemplate(value as typeof pdfTemplate)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="gst_compliant">GST Compliant</SelectItem>
                        <SelectItem value="government">Government Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => saveDocument("draft")} variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button onClick={() => saveDocument("sent")}>
                      <Send className="mr-2 h-4 w-4" />
                      Save & Send
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => generatePDF(documentType, true, undefined, pdfTemplate)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" onClick={() => generatePDF(documentType, false, undefined, pdfTemplate)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" onClick={resetForm}>
                    Clear Form
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Management</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={documentFilter} onValueChange={(value: any) => setDocumentFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="invoice">Invoices</SelectItem>
                      <SelectItem value="quotation">Quotations</SelectItem>
                      <SelectItem value="purchase_order">Purchase Orders</SelectItem>
                      <SelectItem value="sales_order">Sales Orders</SelectItem>
                      <SelectItem value="receipt">Receipts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon(doc.type)}
                          <div>
                            <p className="font-medium">{doc.documentNumber}</p>
                            <p className="text-sm text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{doc.date.toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>₹{doc.grandTotal.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(doc.status) as any}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePDF(doc.type, true, doc, pdfTemplate)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePDF(doc.type, false, doc, pdfTemplate)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => editDocument(doc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicateDocument(doc)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Create your first document to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {documents
                    .filter((d) => d.status === "paid")
                    .reduce((sum, doc) => sum + doc.grandTotal, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Paid invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <Receipt className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹
                  {documents
                    .filter((d) => d.status === "sent" || d.status === "overdue")
                    .reduce((sum, doc) => sum + doc.grandTotal, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Unpaid invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.filter((d) => d.date.getMonth() === new Date().getMonth()).length}
                </div>
                <p className="text-xs text-muted-foreground">Documents created</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 10)
                    .map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getDocumentIcon(doc.type)}
                            <div>
                              <p className="font-medium">{doc.documentNumber}</p>
                              <p className="text-sm text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.customer.name}</TableCell>
                        <TableCell>{doc.date.toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>₹{doc.grandTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(doc.status) as any}>{doc.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => {
          setIsPDFPreviewOpen(false)
          if (previewPDFUrl) {
            URL.revokeObjectURL(previewPDFUrl)
            setPreviewPDFUrl("")
          }
        }}
        pdfUrl={previewPDFUrl}
        title={`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Preview`}
      />
    </div>
  )
}

function AddCustomerForm({ onAdd, onClose }: { onAdd: (customer: Omit<Customer, "id">) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    customerType: "B2C" as "B2B" | "B2C",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      alert("Name and phone are required")
      return
    }
    onAdd(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerType">Customer Type</Label>
          <Select
            value={formData.customerType || ""}
            onValueChange={(value: string) => setFormData({ ...formData, customerType: value as "B2B" | "B2C" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2C">B2C (Individual)</SelectItem>
              <SelectItem value="B2B">B2B (Business)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 9876543210"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="customer@example.com"
          />
        </div>
      </div>

      {formData.customerType === "B2B" && (
        <div className="space-y-2">
          <Label htmlFor="gst">GST Number</Label>
          <Input
            id="gst"
            value={formData.gst}
            onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
            placeholder="29ABCDE1234F1Z5"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
              <SelectItem value="Rajasthan">Rajasthan</SelectItem>
              <SelectItem value="West Bengal">West Bengal</SelectItem>
              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            placeholder="400001"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
    </form>
  )
}
