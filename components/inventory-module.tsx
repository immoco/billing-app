"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  ShoppingCart,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  description: string
  category: string
  brand: string
  sku: string
  hsn: string
  rate: number
  tax: number
  stock: number
  minstock: number
  costprice: number
  sellingprice: number
  status: "active" | "inactive"
  supplier?: string
  barcode?: string
  lastUpdated: Date
}

interface StockMovement {
  id: string
  productId: number
  productName: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  date: Date
  reference?: string
  notes?: string
}

export default function InventoryModule() {
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
  //     minstock: 5,
  //     costPrice: 38000,
  //     sellingprice: 45000,
  //     status: "active",
  //     supplier: "Dell India",
  //     barcode: "1234567890123",
  //     lastUpdated: new Date(),
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
  //     minstock: 3,
  //     costPrice: 32000,
  //     sellingprice: 38000,
  //     status: "active",
  //     supplier: "HP India",
  //     barcode: "1234567890124",
  //     lastUpdated: new Date(),
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
  //     minstock: 2,
  //     costPrice: 75000,
  //     sellingprice: 85000,
  //     status: "active",
  //     supplier: "Apple India",
  //     barcode: "1234567890125",
  //     lastUpdated: new Date(),
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
  //     minstock: 10,
  //     costPrice: 1500,
  //     sellingprice: 2000,
  //     status: "active",
  //     supplier: "Local Supplier",
  //     barcode: "1234567890126",
  //     lastUpdated: new Date(),
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
  //     minstock: 20,
  //     costPrice: 1200,
  //     sellingprice: 1500,
  //     status: "active",
  //     supplier: "Logitech India",
  //     barcode: "1234567890127",
  //     lastUpdated: new Date(),
  //   },
  // ])
  const [products, setProducts] = useState<Product[]>([]);


  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
  }, []);

  console.log(products);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    hsn: "",
    rate: 0,
    tax: 18,
    stock: 0,
    minstock: 0,
    costprice: 0,
    sellingprice: 0,
    supplier: "",
    barcode: "",
  })

  const [stockAdjustment, setStockAdjustment] = useState({
    type: "in" as "in" | "out" | "adjustment",
    quantity: 0,
    reason: "",
    reference: "",
    notes: "",
  })

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]
  const statuses = ["all", "active", "inactive"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const lowStockProducts = products.filter((product) => product.stock <= product.minstock)
  const totalStockValue = products.reduce((sum, product) => sum + product.stock * product.costprice, 0)
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === "active").length

  const addProduct = () => {
    if (!newProduct.name || !newProduct.sku) {
      toast({
        title: "Validation Error",
        description: "Product name and SKU are required.",
        variant: "destructive",
      })
      return
    }

    const product: Product = {
      ...newProduct,
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      status: "active",
      lastUpdated: new Date(),
    }

    setProducts([...products, product])
    setIsAddProductOpen(false)
    setNewProduct({
      name: "",
      description: "",
      category: "",
      brand: "",
      sku: "",
      hsn: "",
      rate: 0,
      tax: 18,
      stock: 0,
      minstock: 0,
      costprice: 0,
      sellingprice: 0,
      supplier: "",
      barcode: "",
    })

    toast({
      title: "Product Added",
      description: "Product has been added successfully.",
    })
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? { ...updatedProduct, lastUpdated: new Date() } : p)))
    setEditingProduct(null)

    toast({
      title: "Product Updated",
      description: "Product has been updated successfully.",
    })
  }

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))

    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully.",
    })
  }

  const adjustStock = () => {
    if (!selectedProduct || stockAdjustment.quantity === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    let newStock = selectedProduct.stock
    if (stockAdjustment.type === "in") {
      newStock += stockAdjustment.quantity
    } else if (stockAdjustment.type === "out") {
      newStock -= stockAdjustment.quantity
    } else {
      newStock = stockAdjustment.quantity
    }

    if (newStock < 0) {
      toast({
        title: "Invalid Stock",
        description: "Stock cannot be negative.",
        variant: "destructive",
      })
      return
    }

    // Update product stock
    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? { ...p, stock: newStock, lastUpdated: new Date() } : p)),
    )

    // Add stock movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: stockAdjustment.type,
      quantity: stockAdjustment.quantity,
      reason: stockAdjustment.reason,
      date: new Date(),
      reference: stockAdjustment.reference,
      notes: stockAdjustment.notes,
    }

    setStockMovements([movement, ...stockMovements])
    setIsStockAdjustmentOpen(false)
    setSelectedProduct(null)
    setStockAdjustment({
      type: "in",
      quantity: 0,
      reason: "",
      reference: "",
      notes: "",
    })

    toast({
      title: "Stock Updated",
      description: `Stock has been ${stockAdjustment.type === "in" ? "increased" : stockAdjustment.type === "out" ? "decreased" : "adjusted"} successfully.`,
    })
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (product.stock <= product.minstock) {
      return <Badge variant="secondary">Low Stock</Badge>
    } else {
      return <Badge variant="default">In Stock</Badge>
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "adjustment":
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Manage products, track stock levels, and monitor inventory movements</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Enter product details to add to inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Enter SKU"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter product description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      placeholder="Brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsn">HSN Code</Label>
                    <Input
                      id="hsn"
                      value={newProduct.hsn}
                      onChange={(e) => setNewProduct({ ...newProduct, hsn: e.target.value })}
                      placeholder="HSN Code"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costprice">Cost Price</Label>
                    <Input
                      id="costprice"
                      type="number"
                      value={newProduct.costprice}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, costprice: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellingprice">Selling Price</Label>
                    <Input
                      id="sellingprice"
                      type="number"
                      value={newProduct.sellingprice}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sellingprice: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minstock">Min Stock Level</Label>
                    <Input
                      id="minstock"
                      type="number"
                      value={newProduct.minstock}
                      onChange={(e) => setNewProduct({ ...newProduct, minstock: Number.parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax Rate (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      value={newProduct.tax}
                      onChange={(e) => setNewProduct({ ...newProduct, tax: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="18"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      placeholder="Barcode"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={addProduct}>
                  Add Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isStockAdjustmentOpen} onOpenChange={setIsStockAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>Adjust stock levels for products</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select
                    value={selectedProduct ? selectedProduct.id.toString() : undefined}
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === parseInt(value));
                      setSelectedProduct(product || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{product.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">Stock: {product.stock}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">Adjustment Type</Label>
                    <Select
                      value={stockAdjustment.type}
                      onValueChange={(value: "in" | "out" | "adjustment") =>
                        setStockAdjustment({ ...stockAdjustment, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={stockAdjustment.quantity}
                      onChange={(e) =>
                        setStockAdjustment({ ...stockAdjustment, quantity: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select
                    value={stockAdjustment.reason}
                    onValueChange={(value) => setStockAdjustment({ ...stockAdjustment, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Sale">Sale</SelectItem>
                      <SelectItem value="Return">Return</SelectItem>
                      <SelectItem value="Damage">Damage</SelectItem>
                      <SelectItem value="Loss">Loss</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Correction">Correction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={stockAdjustment.reference}
                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, reference: e.target.value })}
                    placeholder="Reference number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={stockAdjustment.notes}
                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={adjustStock}>
                  Adjust Stock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{activeProducts} active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
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
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{product.stock}</span>
                          {getStockStatus(product)}
                        </div>
                      </TableCell>
                      <TableCell>{product.minstock}</TableCell>
                      <TableCell>₹{product.costprice.toLocaleString()}</TableCell>
                      <TableCell>₹{product.sellingprice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsStockAdjustmentOpen(true)
                            }}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}>
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
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date.toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getMovementIcon(movement.type)}
                          <span className="capitalize">{movement.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.type === "in"
                              ? "text-green-600"
                              : movement.type === "out"
                                ? "text-red-600"
                                : "text-blue-600"
                          }
                        >
                          {movement.type === "out" ? "-" : movement.type === "in" ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.reference || "-"}</TableCell>
                      <TableCell>{movement.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {product.stock} | Min: {product.minstock}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">All products are well stocked!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products by Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products
                    .sort((a, b) => b.stock * b.costprice - a.stock * a.costprice)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(product.stock * product.costprice).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Value</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Product Name</Label>
                  <Input
                    id="editName"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSku">SKU</Label>
                  <Input
                    id="editSku"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editcostprice">Cost Price</Label>
                  <Input
                    id="editcostprice"
                    type="number"
                    value={editingProduct.costprice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, costprice: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editsellingprice">Selling Price</Label>
                  <Input
                    id="editsellingprice"
                    type="number"
                    value={editingProduct.sellingprice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sellingprice: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingProduct.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingProduct({ ...editingProduct, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => updateProduct(editingProduct)}>
                Update Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
