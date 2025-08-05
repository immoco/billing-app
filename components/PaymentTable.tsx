"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CreditCard, AlertCircle, CheckCircle, Clock, Send, Eye } from "lucide-react"

interface PaymentData {
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

interface PaymentTableProps {
  data?: PaymentData[]
  onRecordPayment?: (paymentId: string) => void
  onSendReminder?: (paymentId: string) => void
  onViewDetails?: (paymentId: string) => void
}

export default function PaymentTable({ data = [], onRecordPayment, onSendReminder, onViewDetails }: PaymentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const defaultData: PaymentData[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      partyName: "Tech Solutions Ltd",
      amount: 125000,
      dueDate: "2024-01-20",
      status: "pending",
      daysOverdue: 5,
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      partyName: "ABC Enterprises",
      amount: 85000,
      dueDate: "2024-01-18",
      status: "paid",
      paymentDate: "2024-01-17",
      paymentMode: "Bank Transfer",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      partyName: "XYZ Corp",
      amount: 95000,
      dueDate: "2024-01-15",
      status: "overdue",
      daysOverdue: 10,
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-004",
      partyName: "Global Tech",
      amount: 150000,
      dueDate: "2024-01-25",
      status: "partial",
      remainingAmount: 75000,
      paymentDate: "2024-01-20",
      paymentMode: "Cash",
    },
  ]

  const payments = data.length > 0 ? data : defaultData
  const statuses = ["all", "pending", "paid", "overdue", "partial"]

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

  const totalReceivables = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + (p.remainingAmount || p.amount), 0)
  const overdueAmount = payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)
  const overdueCount = payments.filter((p) => p.status === "overdue").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overdueCount} overdue invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((payments.filter((p) => p.status === "paid").length / payments.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracking</CardTitle>
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
                  <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.partyName}</TableCell>
                  <TableCell>
                    <div>
                      <div>₹{payment.amount.toLocaleString()}</div>
                      {payment.remainingAmount && payment.remainingAmount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Remaining: ₹{payment.remainingAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {payment.daysOverdue && payment.daysOverdue > 0 ? (
                      <span className="text-red-600 font-medium">{payment.daysOverdue} days</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {payment.status !== "paid" && (
                        <Button variant="outline" size="sm" onClick={() => onRecordPayment?.(payment.id)}>
                          <CreditCard className="h-4 w-4 mr-1" />
                          Record
                        </Button>
                      )}
                      {(payment.status === "pending" || payment.status === "overdue") && (
                        <Button variant="outline" size="sm" onClick={() => onSendReminder?.(payment.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Remind
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onViewDetails?.(payment.id)}>
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
    </div>
  )
}
