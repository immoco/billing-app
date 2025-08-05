"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Users, Bell, Shield, Download, Upload, Save, Plus, Edit, Trash2 } from "lucide-react"
import TemplateSelector from "@/components/template-selector"
import { useToast } from "@/components/ui/use-toast"

interface CompanySettings {
  name: string
  gst: string
  phone: string
  email: string
  address: string
  website: string
  logo?: string
}

interface InvoiceSettings {
  invoicePrefix: string
  invoiceStartNumber: number
  quotationPrefix: string
  paymentTerms: number
  autoGeneratePDF: boolean
  includeLogo: boolean
  watermark: string
}

interface PDFSettings {
  defaultTemplate: "professional" | "modern" | "minimal" | "detailed"
  paperSize: "a4" | "letter" | "legal"
  watermark: string
  autoGenerate: boolean
  includeLogo: boolean
}

interface AppPreferences {
  darkMode: boolean
  notifications: boolean
  currency: string
  dateFormat: string
  lowStockThreshold: number
}

export default function SettingsModule() {
  const { toast } = useToast()

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "BizManager Pro",
    gst: "27ABCDE1234F1Z5",
    phone: "+91 9876543210",
    email: "contact@company.com",
    address: "123 Business Street, City, State - 400001",
    website: "www.bizmanager.com",
  })

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    invoicePrefix: "INV",
    invoiceStartNumber: 1001,
    quotationPrefix: "QUO",
    paymentTerms: 30,
    autoGeneratePDF: true,
    includeLogo: true,
    watermark: "",
  })

  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    defaultTemplate: "professional",
    paperSize: "a4",
    watermark: "",
    autoGenerate: true,
    includeLogo: true,
  })

  const [appPreferences, setAppPreferences] = useState<AppPreferences>({
    darkMode: false,
    notifications: true,
    currency: "inr",
    dateFormat: "dd-mm-yyyy",
    lowStockThreshold: 5,
  })

  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")

  const users = [
    { id: 1, name: "Admin User", email: "admin@company.com", role: "Admin", status: "Active" },
    { id: 2, name: "Billing Staff", email: "billing@company.com", role: "Billing", status: "Active" },
    { id: 3, name: "Inventory Manager", email: "inventory@company.com", role: "Inventory", status: "Active" },
  ]

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedCompanySettings = localStorage.getItem("companySettings")
    const savedInvoiceSettings = localStorage.getItem("invoiceSettings")
    const savedPdfSettings = localStorage.getItem("pdfSettings")
    const savedAppPreferences = localStorage.getItem("appPreferences")

    if (savedCompanySettings) {
      setCompanySettings(JSON.parse(savedCompanySettings))
    }
    if (savedInvoiceSettings) {
      setInvoiceSettings(JSON.parse(savedInvoiceSettings))
    }
    if (savedPdfSettings) {
      setPdfSettings(JSON.parse(savedPdfSettings))
    }
    if (savedAppPreferences) {
      setAppPreferences(JSON.parse(savedAppPreferences))
    }
  }, [])

  const saveAllSettings = () => {
    try {
      localStorage.setItem("companySettings", JSON.stringify(companySettings))
      localStorage.setItem("invoiceSettings", JSON.stringify(invoiceSettings))
      localStorage.setItem("pdfSettings", JSON.stringify(pdfSettings))
      localStorage.setItem("appPreferences", JSON.stringify(appPreferences))

      toast({
        title: "Settings Saved",
        description: "All settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportSettings = () => {
    const allSettings = {
      company: companySettings,
      invoice: invoiceSettings,
      pdf: pdfSettings,
      preferences: appPreferences,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `bizmanager-settings-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Settings Exported",
      description: "Settings have been exported successfully.",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)

        if (settings.company) setCompanySettings(settings.company)
        if (settings.invoice) setInvoiceSettings(settings.invoice)
        if (settings.pdf) setPdfSettings(settings.pdf)
        if (settings.preferences) setAppPreferences(settings.preferences)

        toast({
          title: "Settings Imported",
          description: "Settings have been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const resetToDefaults = () => {
    setCompanySettings({
      name: "BizManager Pro",
      gst: "27ABCDE1234F1Z5",
      phone: "+91 9876543210",
      email: "contact@company.com",
      address: "123 Business Street, City, State - 400001",
      website: "www.bizmanager.com",
    })

    setInvoiceSettings({
      invoicePrefix: "INV",
      invoiceStartNumber: 1001,
      quotationPrefix: "QUO",
      paymentTerms: 30,
      autoGeneratePDF: true,
      includeLogo: true,
      watermark: "",
    })

    setPdfSettings({
      defaultTemplate: "professional",
      paperSize: "a4",
      watermark: "",
      autoGenerate: true,
      includeLogo: true,
    })

    setAppPreferences({
      darkMode: false,
      notifications: true,
      currency: "inr",
      dateFormat: "dd-mm-yyyy",
      lowStockThreshold: 5,
    })

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("import-settings")?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input id="import-settings" type="file" accept=".json" onChange={importSettings} className="hidden" />
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveAllSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={companySettings.gst}
                    onChange={(e) => setCompanySettings({ ...companySettings, gst: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure invoice numbering and templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceStart">Starting Number</Label>
                  <Input
                    id="invoiceStart"
                    type="number"
                    value={invoiceSettings.invoiceStartNumber}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        invoiceStartNumber: Number.parseInt(e.target.value) || 1001,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quotationPrefix">Quotation Prefix</Label>
                  <Input
                    id="quotationPrefix"
                    value={invoiceSettings.quotationPrefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, quotationPrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={invoiceSettings.paymentTerms}
                    onChange={(e) =>
                      setInvoiceSettings({ ...invoiceSettings, paymentTerms: Number.parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF Settings</CardTitle>
              <CardDescription>Configure PDF generation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pdfTemplate">Default Template</Label>
                  <Select
                    value={pdfSettings.defaultTemplate}
                    onValueChange={(value: "professional" | "modern" | "minimal" | "detailed") =>
                      setPdfSettings({ ...pdfSettings, defaultTemplate: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdfFormat">Paper Size</Label>
                  <Select
                    value={pdfSettings.paperSize}
                    onValueChange={(value: "a4" | "letter" | "legal") =>
                      setPdfSettings({ ...pdfSettings, paperSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="watermark">Watermark Text (Optional)</Label>
                <Input
                  id="watermark"
                  placeholder="PAID, DRAFT, etc."
                  value={pdfSettings.watermark}
                  onChange={(e) => setPdfSettings({ ...pdfSettings, watermark: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate PDF on invoice save</Label>
                  <p className="text-sm text-muted-foreground">Automatically create PDF when saving invoices</p>
                </div>
                <Switch
                  checked={pdfSettings.autoGenerate}
                  onCheckedChange={(checked) => setPdfSettings({ ...pdfSettings, autoGenerate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include company logo</Label>
                  <p className="text-sm text-muted-foreground">Show company logo on PDF documents</p>
                </div>
                <Switch
                  checked={pdfSettings.includeLogo}
                  onCheckedChange={(checked) => setPdfSettings({ ...pdfSettings, includeLogo: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure what each role can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                  <div>Permission</div>
                  <div>Admin</div>
                  <div>Billing</div>
                  <div>Inventory</div>
                </div>

                {[
                  "Create Invoices",
                  "View Reports",
                  "Manage Inventory",
                  "Manage Customers",
                  "System Settings",
                  "User Management",
                ].map((permission, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-sm">{permission}</div>
                    <Switch defaultChecked />
                    <Switch defaultChecked={permission !== "System Settings" && permission !== "User Management"} />
                    <Switch defaultChecked={permission === "Manage Inventory"} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Application Preferences
              </CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch
                  checked={appPreferences.darkMode}
                  onCheckedChange={(checked) => setAppPreferences({ ...appPreferences, darkMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive system notifications</p>
                </div>
                <Switch
                  checked={appPreferences.notifications}
                  onCheckedChange={(checked) => setAppPreferences({ ...appPreferences, notifications: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select
                  value={appPreferences.currency}
                  onValueChange={(value) => setAppPreferences({ ...appPreferences, currency: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={appPreferences.dateFormat}
                  onValueChange={(value) => setAppPreferences({ ...appPreferences, dateFormat: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Low Stock Alert Threshold</Label>
                <Input
                  type="number"
                  className="w-48"
                  value={appPreferences.lowStockThreshold}
                  onChange={(e) =>
                    setAppPreferences({ ...appPreferences, lowStockThreshold: Number.parseInt(e.target.value) || 5 })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Data Backup & Security
              </CardTitle>
              <CardDescription>Manage your data backups and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Daily automatic data backup</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Manual Backup</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={exportSettings}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById("restore-backup")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                  <input id="restore-backup" type="file" accept=".json" onChange={importSettings} className="hidden" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Backup</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-IN")} at {new Date().toLocaleTimeString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export your data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Customers
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Products
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Invoices
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Template Settings</CardTitle>
              <CardDescription>Configure your default PDF templates and styling</CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                selectedTemplate={pdfSettings.defaultTemplate}
                onTemplateSelect={(template) => setPdfSettings({ ...pdfSettings, defaultTemplate: template })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
