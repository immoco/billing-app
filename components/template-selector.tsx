"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Check } from "lucide-react"

interface TemplateOption {
  id: "professional" | "modern" | "minimal" | "detailed"
  name: string
  description: string
  features: string[]
  preview: string
  recommended?: boolean
}

interface TemplateSelectorProps {
  selectedTemplate: "professional" | "modern" | "minimal" | "detailed"
  onTemplateSelect: (template: "professional" | "modern" | "minimal" | "detailed") => void
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const templates: TemplateOption[] = [
    {
      id: "professional",
      name: "Professional",
      description: "Clean and business-ready design with company branding",
      features: ["Company logo", "GST compliant", "Terms & conditions", "Professional layout"],
      preview: "/placeholder.svg?height=200&width=150&text=Professional",
      recommended: true,
    },
    {
      id: "modern",
      name: "Modern",
      description: "Contemporary design with gradient headers and clean typography",
      features: ["Gradient header", "Modern typography", "Minimalist design", "Color accents"],
      preview: "/placeholder.svg?height=200&width=150&text=Modern",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple and clean design focusing on essential information",
      features: ["Clean lines", "Essential info only", "Fast generation", "Lightweight"],
      preview: "/placeholder.svg?height=200&width=150&text=Minimal",
    },
    {
      id: "detailed",
      name: "Detailed",
      description: "Comprehensive template with all business details and signatures",
      features: ["Signature blocks", "Detailed breakdown", "HSN codes", "Complete info"],
      preview: "/placeholder.svg?height=200&width=150&text=Detailed",
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Template Style</h3>
        <p className="text-sm text-muted-foreground">Select a template that matches your business needs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {template.recommended && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                  {selectedTemplate === template.id && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={`${template.name} template preview`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-muted-foreground">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>

              <Button
                variant={selectedTemplate === template.id ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onTemplateSelect(template.id)
                }}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    Selected
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-3 w-3" />
                    Select
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
