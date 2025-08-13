"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  CreditCard,
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  Users,
  ShoppingCart,
  Receipt,
  UserPlus,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

// Sample data with proper initialization
const revenueData = [
  { month: "Aug", revenue: 450000, expenses: 320000, profit: 130000 },
  { month: "Sep", revenue: 520000, expenses: 380000, profit: 140000 },
  { month: "Oct", revenue: 480000, expenses: 350000, profit: 130000 },
  { month: "Nov", revenue: 620000, expenses: 420000, profit: 200000 },
  { month: "Dec", revenue: 580000, expenses: 400000, profit: 180000 },
  { month: "Jan", revenue: 680000, expenses: 450000, profit: 230000 },
]

const lowStockItems = [
  { id: 1, name: "MacBook Air M1", currentStock: 0, minStock: 2, status: "critical" },
  { id: 2, name: "HP EliteBook 840", currentStock: 1, minStock: 3, status: "critical" },
  { id: 3, name: "Dell Latitude 7420", currentStock: 2, minStock: 5, status: "warning" },
  { id: 4, name: "Wireless Mouse", currentStock: 8, minStock: 20, status: "low" },
  { id: 5, name: "Laptop Bag", currentStock: 12, minStock: 25, status: "low" },
]

const recentActivities = [
  {
    id: 1,
    type: "sale",
    description: "Invoice INV-001234 created for Tech Solutions Ltd",
    amount: 45000,
    time: "15m ago",
    status: "completed",
  },
  {
    id: 2,
    type: "payment",
    description: "Payment received from ABC Enterprises",
    amount: 38000,
    time: "32m ago",
    status: "completed",
  },
  {
    id: 3,
    type: "expense",
    description: "Office rent payment recorded",
    amount: 25000,
    time: "1h ago",
    status: "completed",
  },
  {
    id: 4,
    type: "stock",
    description: "Stock updated for Dell Latitude 7420",
    amount: null,
    time: "2h ago",
    status: "completed",
  },
  {
    id: 5,
    type: "customer",
    description: "New customer John Doe added",
    amount: null,
    time: "3h ago",
    status: "completed",
  },
  {
    id: 6,
    type: "payment",
    description: "Payment reminder sent to XYZ Corp",
    amount: null,
    time: "4h ago",
    status: "pending",
  },
]

const partyAgingData = [
  {
    party: "Tech Solutions Ltd",
    "0-30": 45000,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
    total: 45000,
  },
  {
    party: "ABC Enterprises",
    "0-30": 38000,
    "31-60": 25000,
    "61-90": 0,
    "90+": 0,
    total: 63000,
  },
  {
    party: "XYZ Corp",
    "0-30": 0,
    "31-60": 35000,
    "61-90": 45000,
    "90+": 30000,
    total: 110000,
  },
  {
    party: "Global Tech",
    "0-30": 28000,
    "31-60": 15000,
    "61-90": 20000,
    "90+": 25000,
    total: 88000,
  },
  {
    party: "Smart Systems",
    "0-30": 14000,
    "31-60": 10000,
    "61-90": 30000,
    "90+": 25000,
    total: 79000,
  },
]

// Calculate totals for aging chart
const calculateAgingTotals = () => {
  return partyAgingData.reduce(
    (acc, party) => ({
      "0-30": acc["0-30"] + (party["0-30"] || 0),
      "31-60": acc["31-60"] + (party["31-60"] || 0),
      "61-90": acc["61-90"] + (party["61-90"] || 0),
      "90+": acc["90+"] + (party["90+"] || 0),
    }),
    { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 },
  )
}

export default function BusinessDashboard() {
  const [healthScore, setHealthScore] = useState(78)
  const [financialMetrics, setFinancialMetrics] = useState({
    cashInHand: 125000,
    stockValue: 2850000,
    bankBalance: 1450000,
    unpaidInvoices: 385000,
  })

  const agingTotals = calculateAgingTotals()
  const agingChartData = [
    { name: "0-30 Days", value: agingTotals["0-30"], color: "#10b981" },
    { name: "31-60 Days", value: agingTotals["31-60"], color: "#f59e0b" },
    { name: "61-90 Days", value: agingTotals["61-90"], color: "#f97316" },
    { name: "90+ Days", value: agingTotals["90+"], color: "#ef4444" },
  ]

  // Calculate financial health score
  useEffect(() => {
    const cashFlow = 85 // Good cash flow
    const profitability = 75 // Decent profit margins
    const liquidity = 80 // Good liquidity ratio
    const growth = 72 // Steady growth

    const score = Math.round((cashFlow + profitability + liquidity + growth) / 4)
    setHealthScore(score)
  }, [])

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (score >= 60) return { status: "Good", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    if (score >= 40) return { status: "Fair", color: "text-orange-600", bgColor: "bg-orange-100" }
    return { status: "Poor", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const healthStatus = getHealthStatus(healthScore)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-600" />
      case "expense":
        return <Receipt className="h-4 w-4 text-red-600" />
      case "stock":
        return <Package className="h-4 w-4 text-purple-600" />
      case "customer":
        return <UserPlus className="h-4 w-4 text-indigo-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Safe number formatting function
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "₹0"
    }
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0"
    }
    return num.toLocaleString('en-IN')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of your business performance and health</p>
        </div>
      </div>

      {/* Financial Health Meter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Financial Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">{healthScore}/100</div>
              <Badge className={`${healthStatus.bgColor} ${healthStatus.color}`}>{healthStatus.status}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Based on key metrics</p>
              <p className="text-xs text-muted-foreground">Last updated: Today</p>
            </div>
          </div>
          <Progress value={healthScore} className="mb-4" />
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium">Cash Flow</p>
              <p className="text-green-600">85%</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Profitability</p>
              <p className="text-yellow-600">75%</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Liquidity</p>
              <p className="text-green-600">80%</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Growth</p>
              <p className="text-blue-600">72%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash in Hand</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.cashInHand)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.stockValue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.bankBalance)}</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialMetrics.unpaidInvoices)}</div>
            <p className="text-xs text-muted-foreground">12 pending invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Low Stock Alerts</span>
              </CardTitle>
              <Badge variant="destructive">{lowStockItems.filter((item) => item.status === "critical").length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {formatNumber(item.currentStock)} / Min: {formatNumber(item.minStock)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStockBadgeColor(item.status)}>{item.status}</Badge>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {activity.amount && (
                        <span className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button className="h-16 flex-col space-y-1">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">New Sale</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1 bg-transparent">
              <Receipt className="h-5 w-5" />
              <span className="text-xs">Record Expense</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1 bg-transparent">
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Add Payment</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1 bg-transparent">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Add Customer</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1 bg-transparent">
              <Package className="h-5 w-5" />
              <span className="text-xs">Update Stock</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-1 bg-transparent">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
          </CardContent>
        </Card>

        {/* Party Aging Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Party Aging Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {partyAgingData.map((party, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{party.party}</span>
                      <span className="font-bold">{formatCurrency(party.total)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-green-600">{formatCurrency(party["0-30"])}</p>
                        <p className="text-muted-foreground">0-30</p>
                      </div>
                      <div className="text-center">
                        <p className="text-yellow-600">{formatCurrency(party["31-60"])}</p>
                        <p className="text-muted-foreground">31-60</p>
                      </div>
                      <div className="text-center">
                        <p className="text-orange-600">{formatCurrency(party["61-90"])}</p>
                        <p className="text-muted-foreground">61-90</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-600">{formatCurrency(party["90+"])}</p>
                        <p className="text-muted-foreground">90+</p>
                      </div>
                    </div>
                    {index < partyAgingData.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={agingChartData.filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(agingTotals["0-30"])}</p>
                <p className="text-xs text-muted-foreground">0-30 Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(agingTotals["31-60"])}</p>
                <p className="text-xs text-muted-foreground">31-60 Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(agingTotals["61-90"])}</p>
                <p className="text-xs text-muted-foreground">61-90 Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(agingTotals["90+"])}</p>
                <p className="text-xs text-muted-foreground">90+ Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
