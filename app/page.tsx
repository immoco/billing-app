"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BusinessDashboard from "@/components/business-dashboard"
import BillingModule from "@/components/enhanced-billing-module"
import InventoryModule from "@/components/inventory-module"
import CustomerModule from "@/components/customer-module"
import PaymentModule from "@/components/payment-module"
import ReportsModule from "@/components/reports-module"
import SettingsModule from "@/components/settings-module"
// import InventoryModuleTest from "@/components/inv-mod-test"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Business Management System</h1>
        <p className="text-muted-foreground">Complete solution for billing, inventory, and business management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BusinessDashboard />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingModule />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryModule />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerModule />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsModule />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsModule />
        </TabsContent>
      </Tabs>
    </div>
  )
}
