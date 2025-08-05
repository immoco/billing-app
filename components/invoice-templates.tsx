"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Edit } from "lucide-react"

interface InvoiceTemplate {
  id: string
  name: string
  description: string
  type: "invoice" | "quotation" | "receipt"
  isDefault: boolean
  preview: string
}

export default function InvoiceTemplates() {
  const templates: InvoiceTemplate[] = [
    {
      id: "1",
      name: "Professional Invoice",
      description: "Clean and professional design with company branding",
      type: "invoice",
      isDefault: true,
      preview: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "2",
      name: "Modern Quotation",
      description: "Modern design perfect for quotations and estimates",
      type: "quotation",
      isDefault: false,
      preview: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "3",
      name: "Simple Receipt",
      description: "Minimalist receipt template for quick transactions",
      type: "receipt",
      isDefault: false,
      preview: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "4",
      name: "Detailed Invoice",
      description: "Comprehensive template with detailed breakdown",
      type: "invoice",
      isDefault: false,
      preview: "/placeholder.svg?height=200&width=150",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Invoice Templates</h3>
          <p className="text-muted-foreground">Choose and customize your invoice templates</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.isDefault && <Badge variant="default">Default</Badge>}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="mr-2 h-4 w-4" />
                  Customize
                </Button>
              </div>

              <Button className="w-full" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
