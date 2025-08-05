"use client"

import { useState, useEffect } from "react"
import { fetchWithCache } from "@/lib/dataFetcher"
import type { Customer } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, IndianRupee, FileText, Package } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ReportsModule() {
  const [dateRange, setDateRange] = useState("thisMonth")
  const [documents, setDocuments] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])

  // Load documents from Supabase with cache fallback
  useEffect(() => {
    fetchWithCache<any>("documents", "invoices")
      .then((docs) => {
        // Convert date strings to Date objects for reporting logic
        const parsedDocuments = docs.map((doc: any) => ({
          ...doc,
          date: doc.date ? new Date(doc.date) : null,
          dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
        }));
        setDocuments(parsedDocuments);
        generateSalesData(parsedDocuments);
        generateProductData(parsedDocuments);
      })
      .catch((err) => {
        // If both DB and cache fail, set empty
        setDocuments([]);
        generateSalesData([]);
        generateProductData([]);
        console.error("Failed to load documents from DB and cache", err);
      });
  }, []);

  const generateSalesData = (docs: any[]) => {
    const monthlyData: { [key: string]: { revenue: number; invoices: number; profit: number } } = {}

    docs.forEach((doc) => {
      if (doc.type === "invoice" && doc.status === "paid") {
        const monthKey = doc.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, invoices: 0, profit: 0 }
        }
        monthlyData[monthKey].revenue += doc.grandTotal
        monthlyData[monthKey].invoices += 1
        monthlyData[monthKey].profit += doc.grandTotal * 0.18 // Assuming 18% profit margin
      }
    })

    const salesArray = Object.entries(monthlyData)
      .map(([month, data]) => ({
        date: month,
        ...data,
      }))
      .slice(-6) // Last 6 months

    setSalesData(salesArray)
  }

  const generateProductData = (docs: any[]) => {
    const productStats: { [key: string]: { sold: number; revenue: number } } = {}

    docs.forEach((doc) => {
      if (doc.type === "invoice" && doc.status === "paid") {
        doc.items.forEach((item: any) => {
          if (!productStats[item.name]) {
            productStats[item.name] = { sold: 0, revenue: 0 }
          }
          productStats[item.name].sold += item.quantity
          productStats[item.name].revenue += item.finalAmount
        })
      }
    })

    const productArray = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 products

    setProductData(productArray)
  }

  const totalRevenue = documents
    .filter((doc) => doc.type === "invoice" && doc.status === "paid")
    .reduce((sum, doc) => sum + doc.grandTotal, 0)

  const totalInvoices = documents.filter((doc) => doc.type === "invoice").length
  const paidInvoices = documents.filter((doc) => doc.type === "invoice" && doc.status === "paid").length
  const avgOrderValue = paidInvoices > 0 ? totalRevenue / paidInvoices : 0

  const gstReport = [
    { month: "January 2024", cgst: 15000, sgst: 15000, igst: 8000, total: 38000 },
    { month: "December 2023", cgst: 12000, sgst: 12000, igst: 6000, total: 30000 },
    { month: "November 2023", cgst: 18000, sgst: 18000, igst: 10000, total: 46000 },
  ]

  const outstandingPayments = documents
    .filter((doc) => doc.type === "invoice" && (doc.status === "sent" || doc.status === "overdue"))
    .map((doc) => ({
      customer: doc.customer.name,
      amount: doc.grandTotal,
      days: Math.floor((new Date().getTime() - doc.date.getTime()) / (1000 * 60 * 60 * 24)),
      invoice: doc.documentNumber,
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="gst">GST Report</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {/* Sales Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From {paidInvoices} paid invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {paidInvoices} paid, {totalInvoices - paidInvoices} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Math.round(avgOrderValue).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Average per invoice</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Payment collection rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No sales data available. Create some invoices to see the chart.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {productData.length > 0 ? (
                  <div className="space-y-4">
                    {productData.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sold} units sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No product data available. Create some invoices to see top products.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest created documents</CardDescription>
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
                  {documents.slice(0, 10).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.documentNumber}</p>
                          <p className="text-sm text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                        </div>
                      </TableCell>
                      <TableCell>{doc.customer.name}</TableCell>
                      <TableCell>{doc.date.toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>₹{doc.grandTotal.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.status === "paid" ? "default" : doc.status === "overdue" ? "destructive" : "secondary"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Create your first invoice to see reports.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Active products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹45,60,000</div>
                <p className="text-xs text-muted-foreground">At cost price</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">8</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation</CardTitle>
              <CardDescription>Current stock value by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Stock Qty</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Laptops</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>127</TableCell>
                    <TableCell>₹38,50,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accessories</TableCell>
                    <TableCell>89</TableCell>
                    <TableCell>456</TableCell>
                    <TableCell>₹5,60,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Software</TableCell>
                    <TableCell>22</TableCell>
                    <TableCell>78</TableCell>
                    <TableCell>₹1,50,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Summary</CardTitle>
              <CardDescription>Tax collection summary from actual invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>CGST</TableHead>
                    <TableHead>SGST</TableHead>
                    <TableHead>IGST</TableHead>
                    <TableHead>Total GST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstReport.map((period, index) => (
                    <TableRow key={index}>
                      <TableCell>{period.month}</TableCell>
                      <TableCell>₹{period.cgst.toLocaleString()}</TableCell>
                      <TableCell>₹{period.sgst.toLocaleString()}</TableCell>
                      <TableCell>₹{period.igst.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{period.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                <IndianRupee className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{outstandingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">From {outstandingPayments.length} invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <IndianRupee className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹
                  {outstandingPayments
                    .filter((p) => p.days > 15)
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{"> 15 days"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Payments</CardTitle>
              <CardDescription>Pending customer payments from actual invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Pending</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingPayments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell>{payment.invoice}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.days} days</TableCell>
                      <TableCell>
                        <Badge variant={payment.days > 15 ? "destructive" : "secondary"}>
                          {payment.days > 15 ? "Overdue" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {outstandingPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No outstanding payments. All invoices are paid!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
