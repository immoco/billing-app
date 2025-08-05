"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  Search,
  CalendarIcon,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Eye,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Payment {
  id: string
  invoiceNumber: string
  partyName: string
  amount: number
  dueDate: string
  status: "paid" | "pending" | "overdue" | "partial"
  paymentDate?: string
  paymentMode?: string
  remainingAmount?: number
  daysOverdue?: number
}

interface PaymentReminder {
  id: string
  partyName: string
  invoiceNumber: string
  amount: number
  daysOverdue: number
  lastReminderDate: string
  reminderCount: number
  contactMethod: "email" | "sms" | "whatsapp" | "call"
}

// Define payment transaction interface
interface PaymentTransaction {
  id: string
  date: Date
  amount: number
  mode: "cash" | "bank" | "card" | "upi" | "cheque"
  reference: string
  notes?: string
}

// Define payment record interface
interface PaymentRecord {
  id: string
  invoiceNumber: string
  partyName: string
  partyType: "customer" | "supplier"
  dueDate: Date
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  status: "paid" | "pending" | "overdue" | "partial"
  paymentHistory: PaymentTransaction[]
  createdAt: Date
}

export default function PaymentModule() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [reminders, setReminders] = useState<PaymentReminder[]>([
    {
      id: "1",
      partyName: "Tech Solutions Ltd",
      invoiceNumber: "INV-2024-001",
      amount: 125000,
      daysOverdue: 5,
      lastReminderDate: "2024-01-22",
      reminderCount: 2,
      contactMethod: "email",
    },
    {
      id: "2",
      partyName: "XYZ Corp",
      invoiceNumber: "INV-2024-003",
      amount: 95000,
      daysOverdue: 10,
      lastReminderDate: "2024-01-20",
      reminderCount: 3,
      contactMethod: "whatsapp",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentDate, setPaymentDate] = useState<Date>()

  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentMode: "",
    reference: "",
    notes: "",
  })

  const [reminderTemplate, setReminderTemplate] = useState({
    type: "gentle",
    method: "email",
    customMessage: "",
  })

  const statuses = ["all", "pending", "paid", "overdue", "partial"]
  const paymentModes = ["Cash", "Bank Transfer", "Cheque", "UPI", "Credit Card", "Debit Card"]
  const reminderTypes = ["gentle", "firm", "final", "legal"]
  const contactMethods = ["email", "sms", "whatsapp", "call"]

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CreditCard className="w-3 h-3 mr-1" />
            Partial
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleRecordPayment = () => {
    if (selectedPayment) {
      const updatedPayments = payments.map((payment) => {
        if (payment.id === selectedPayment.id) {
          const isFullPayment = newPayment.amount >= (payment.remainingAmount || payment.amount)
          return {
            ...payment,
            status: isFullPayment ? ("paid" as const) : ("partial" as const),
            paymentDate: paymentDate?.toISOString().split("T")[0],
            paymentMode: newPayment.paymentMode,
            remainingAmount: isFullPayment ? 0 : (payment.remainingAmount || payment.amount) - newPayment.amount,
          }
        }
        return payment
      })

      setPayments(updatedPayments)
      setIsPaymentDialogOpen(false)
      setSelectedPayment(null)
      setNewPayment({ amount: 0, paymentMode: "", reference: "", notes: "" })
      setPaymentDate(undefined)
    }
  }

  const handleSendReminder = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (payment) {
      // In a real app, this would send the actual reminder
      console.log(`Sending ${reminderTemplate.type} reminder to ${payment.partyName} via ${reminderTemplate.method}`)

      // Update reminder history
      const existingReminder = reminders.find((r) => r.invoiceNumber === payment.invoiceNumber)
      if (existingReminder) {
        setReminders(
          reminders.map((r) =>
            r.id === existingReminder.id
              ? { ...r, lastReminderDate: new Date().toISOString().split("T")[0], reminderCount: r.reminderCount + 1 }
              : r,
          ),
        )
      } else {
        const newReminder: PaymentReminder = {
          id: Date.now().toString(),
          partyName: payment.partyName,
          invoiceNumber: payment.invoiceNumber,
          amount: payment.amount,
          daysOverdue: payment.daysOverdue || 0,
          lastReminderDate: new Date().toISOString().split("T")[0],
          reminderCount: 1,
          contactMethod: reminderTemplate.method as "email" | "sms" | "whatsapp" | "call",
        }
        setReminders([...reminders, newReminder])
      }

      setIsReminderDialogOpen(false)
    }
  }

  const getReminderTemplate = (type: string) => {
    const templates = {
      gentle:
        "Dear [Party Name], We hope this message finds you well. We wanted to gently remind you that invoice [Invoice Number] for ₹[Amount] was due on [Due Date]. We would appreciate your prompt payment. Thank you for your business.",
      firm: "Dear [Party Name], This is a firm reminder that invoice [Invoice Number] for ₹[Amount] is now [Days] days overdue. Please arrange for immediate payment to avoid any inconvenience. Contact us if you need assistance.",
      final:
        "Dear [Party Name], This is our FINAL NOTICE for invoice [Invoice Number] for ₹[Amount], which is [Days] days overdue. Immediate payment is required to avoid further action. Please contact us immediately.",
      legal:
        "Dear [Party Name], Despite our previous reminders, invoice [Invoice Number] for ₹[Amount] remains unpaid after [Days] days. We will be compelled to take legal action if payment is not received within 7 days. Please treat this as urgent.",
    }
    return templates[type as keyof typeof templates] || templates.gentle
  }

  const totalReceivables = payments
    .filter((p) => p && p.status !== "paid")
    .reduce((sum, p) => sum + (Number(p.remainingAmount) || Number(p.amount) || 0), 0)

  const overdueAmount = payments
    .filter((p) => p && p.status === "overdue")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const paidAmount = payments
    .filter((p) => p && p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const pendingCount = payments.filter((p) => p && p.status === "pending").length

  // Load payment records from localStorage
  useEffect(() => {
    const savedPayments = localStorage.getItem("paymentRecords")
    const savedDocuments = localStorage.getItem("documents")

    let paymentRecords: Payment[] = []

    if (savedPayments) {
      try {
        const parsedPayments = JSON.parse(savedPayments)
        paymentRecords = parsedPayments.map((record: any) => ({
          id: record.id || Date.now().toString(),
          invoiceNumber: record.invoiceNumber || "N/A",
          partyName: record.partyName || "Unknown",
          amount: Number(record.originalAmount) || 0,
          dueDate: record.dueDate
            ? new Date(record.dueDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          status: record.status || "pending",
          paymentDate:
            record.paymentHistory && record.paymentHistory.length > 0
              ? new Date(record.paymentHistory[0].date).toISOString().split("T")[0]
              : undefined,
          paymentMode:
            record.paymentHistory && record.paymentHistory.length > 0 ? record.paymentHistory[0].mode : undefined,
          remainingAmount: Number(record.remainingAmount) || 0,
          daysOverdue: record.dueDate
            ? Math.max(
                0,
                Math.floor((new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
              )
            : 0,
        }))
      } catch (error) {
        console.error("Error parsing payment records:", error)
        paymentRecords = []
      }
    }

    // Also load from documents if no payment records exist
    if (paymentRecords.length === 0 && savedDocuments) {
      try {
        const documents = JSON.parse(savedDocuments)

        // Convert invoices and receipts to payment records
        paymentRecords = documents
          .filter((doc: any) => doc && (doc.type === "invoice" || doc.type === "receipt"))
          .map((doc: any) => {
            const dueDate = doc.dueDate ? new Date(doc.dueDate) : new Date()
            const today = new Date()
            const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))

            return {
              id: doc.id || Date.now().toString(),
              invoiceNumber: doc.documentNumber || "N/A",
              partyName: doc.customer?.name || "Unknown Customer",
              amount: Number(doc.grandTotal) || 0,
              dueDate: dueDate.toISOString().split("T")[0],
              status:
                doc.type === "receipt"
                  ? "paid"
                  : doc.status === "paid"
                    ? "paid"
                    : daysOverdue > 0
                      ? "overdue"
                      : "pending",
              paymentDate:
                doc.type === "receipt"
                  ? doc.date
                    ? new Date(doc.date).toISOString().split("T")[0]
                    : undefined
                  : undefined,
              paymentMode: doc.paymentMode || undefined,
              remainingAmount: doc.type === "receipt" ? 0 : doc.status === "paid" ? 0 : Number(doc.grandTotal) || 0,
              daysOverdue: daysOverdue,
            }
          })
      } catch (error) {
        console.error("Error parsing documents:", error)
        paymentRecords = []
      }
    }

    setPayments(paymentRecords)
  }, [])

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)

  const recordPayment = (paymentData: {
    date: Date
    amount: number
    mode: string
    reference: string
    notes?: string
  }) => {
    if (!selectedRecord) return

    const newTransaction: PaymentTransaction = {
      id: Date.now().toString(),
      date: paymentData.date,
      amount: paymentData.amount,
      mode: paymentData.mode as any,
      reference: paymentData.reference,
      notes: paymentData.notes,
    }

    const updatedRecord = {
      ...selectedRecord,
      paidAmount: selectedRecord.paidAmount + paymentData.amount,
      remainingAmount: selectedRecord.remainingAmount - paymentData.amount,
      paymentHistory: [...selectedRecord.paymentHistory, newTransaction],
    }

    // Update status based on remaining amount
    if (updatedRecord.remainingAmount <= 0) {
      updatedRecord.status = "paid"
      updatedRecord.remainingAmount = 0
    } else if (updatedRecord.paidAmount > 0) {
      updatedRecord.status = "partial"
    }

    // Update payment records
    const updatedPaymentRecords = paymentRecords.map((record) =>
      record.id === selectedRecord.id ? updatedRecord : record,
    )
    setPaymentRecords(updatedPaymentRecords)
    localStorage.setItem("paymentRecords", JSON.stringify(updatedPaymentRecords))

    // Also update the original document status
    const savedDocuments = localStorage.getItem("documents")
    if (savedDocuments) {
      const documents = JSON.parse(savedDocuments)
      const updatedDocuments = documents.map((doc: any) => {
        if (doc.id === selectedRecord.id) {
          return {
            ...doc,
            status:
              updatedRecord.status === "paid" ? "paid" : updatedRecord.status === "partial" ? "partial" : doc.status,
          }
        }
        return doc
      })
      localStorage.setItem("documents", JSON.stringify(updatedDocuments))
    }

    setIsPaymentDialogOpen(false)
    setSelectedRecord(null)

    toast({
      title: "Payment Recorded",
      description: `Payment of ₹${paymentData.amount.toLocaleString()} recorded successfully.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">Track payments, send reminders, and manage receivables</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Collected payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
              <CardDescription>Track and manage incoming payments from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoiceNumber || "N/A"}</TableCell>
                      <TableCell>{payment.partyName || "Unknown"}</TableCell>
                      <TableCell>
                        <div>
                          <div>₹{(Number(payment.amount) || 0).toLocaleString()}</div>
                          {payment.remainingAmount && Number(payment.remainingAmount) > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Remaining: ₹{(Number(payment.remainingAmount) || 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.dueDate || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(payment.status || "pending")}</TableCell>
                      <TableCell>
                        {payment.daysOverdue && Number(payment.daysOverdue) > 0 ? (
                          <span className="text-red-600 font-medium">{Number(payment.daysOverdue)} days</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {payment.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setNewPayment({
                                  ...newPayment,
                                  amount: Number(payment.remainingAmount) || Number(payment.amount) || 0,
                                })
                                setIsPaymentDialogOpen(true)
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Record Payment
                            </Button>
                          )}
                          {(payment.status === "pending" || payment.status === "overdue") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setIsReminderDialogOpen(true)
                              }}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send Reminder
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Payable</CardTitle>
              <CardDescription>Track and manage outgoing payments to suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Payables management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reminders</CardTitle>
              <CardDescription>Automated and manual payment reminder system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Last Reminder</TableHead>
                    <TableHead>Reminder Count</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.partyName || "Unknown"}</TableCell>
                      <TableCell>{reminder.invoiceNumber || "N/A"}</TableCell>
                      <TableCell>₹{(Number(reminder.amount) || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">{Number(reminder.daysOverdue) || 0} days</span>
                      </TableCell>
                      <TableCell>{reminder.lastReminderDate || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{Number(reminder.reminderCount) || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {reminder.contactMethod === "email" && <Mail className="h-4 w-4 mr-1" />}
                          {reminder.contactMethod === "sms" && <MessageSquare className="h-4 w-4 mr-1" />}
                          {reminder.contactMethod === "whatsapp" && <MessageSquare className="h-4 w-4 mr-1" />}
                          {reminder.contactMethod === "call" && <Phone className="h-4 w-4 mr-1" />}
                          {reminder.contactMethod || "email"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Send Again
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for {selectedPayment?.invoiceNumber} - {selectedPayment?.partyName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                value={newPayment.paymentMode}
                onValueChange={(value) => setNewPayment({ ...newPayment, paymentMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={newPayment.reference}
                onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                placeholder="Transaction reference"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send reminder for {selectedPayment?.invoiceNumber} - {selectedPayment?.partyName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderType">Reminder Type</Label>
                <Select
                  value={reminderTemplate.type}
                  onValueChange={(value) => setReminderTemplate({ ...reminderTemplate, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Reminder
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactMethod">Contact Method</Label>
                <Select
                  value={reminderTemplate.method}
                  onValueChange={(value) => setReminderTemplate({ ...reminderTemplate, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        <div className="flex items-center">
                          {method === "email" && <Mail className="h-4 w-4 mr-2" />}
                          {method === "sms" && <MessageSquare className="h-4 w-4 mr-2" />}
                          {method === "whatsapp" && <MessageSquare className="h-4 w-4 mr-2" />}
                          {method === "call" && <Phone className="h-4 w-4 mr-2" />}
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Message Template</Label>
              <Textarea
                id="template"
                value={getReminderTemplate(reminderTemplate.type)}
                readOnly
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customMessage">Custom Message (Optional)</Label>
              <Textarea
                id="customMessage"
                value={reminderTemplate.customMessage}
                onChange={(e) => setReminderTemplate({ ...reminderTemplate, customMessage: e.target.value })}
                placeholder="Add custom message or modify template"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => selectedPayment && handleSendReminder(selectedPayment.id)}>
              <Send className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
