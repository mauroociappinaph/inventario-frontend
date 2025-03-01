"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Search, Plus, Edit, Trash2, ArrowUpDown, Filter } from "lucide-react"

// Define interfaces for type safety
interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  status: string;
  supplier: string;
  lastUpdated: string;
  [key: string]: string | number; // Índice de firma para permitir acceso con índices de string
}

interface NewItemForm {
  name: string;
  category: string;
  quantity: number;
  supplier: string;
}

// Sample inventory data
const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Running Shoes",
    category: "Footwear",
    quantity: 45,
    status: "In Stock",
    supplier: "Nike Inc.",
    lastUpdated: "2025-02-28",
  },
  {
    id: 2,
    name: "Baseball Cap",
    category: "Accessories",
    quantity: 32,
    status: "In Stock",
    supplier: "Adidas",
    lastUpdated: "2025-02-27",
  },
  {
    id: 3,
    name: "Leather Boots",
    category: "Footwear",
    quantity: 12,
    status: "Low Stock",
    supplier: "Timberland",
    lastUpdated: "2025-02-25",
  },
  {
    id: 4,
    name: "Winter Jacket",
    category: "Clothing",
    quantity: 8,
    status: "Low Stock",
    supplier: "North Face",
    lastUpdated: "2025-02-20",
  },
  {
    id: 5,
    name: "Sunglasses",
    category: "Accessories",
    quantity: 0,
    status: "Out of Stock",
    supplier: "Ray-Ban",
    lastUpdated: "2025-02-15",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: "",
    category: "",
    quantity: 0,
    supplier: "",
  })
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1
      } else {
        return a[sortField] < b[sortField] ? 1 : -1
      }
    })

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Add new item
  const handleAddItem = () => {
    const status = newItem.quantity === 0 ? "Out of Stock" : newItem.quantity <= 15 ? "Low Stock" : "In Stock"

    const newItemWithDetails: InventoryItem = {
      id: inventory.length + 1,
      ...newItem,
      status,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    setInventory([...inventory, newItemWithDetails])
    setNewItem({
      name: "",
      category: "",
      quantity: 0,
      supplier: "",
    })
  }

  // Update item
  const handleUpdateItem = () => {
    if (!editingItem) return

    const status = editingItem.quantity === 0 ? "Out of Stock" : editingItem.quantity <= 15 ? "Low Stock" : "In Stock"

    const updatedItem: InventoryItem = {
      ...editingItem,
      status,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    setInventory(inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item)))

    setEditingItem(null)
  }

  // Delete item
  const handleDeleteItem = (id: number) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800"
      case "Out of Stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#4b3f72]">YOUR WEBSITE</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-gray-700">
              About us
            </Link>
            <Link href="/work" className="text-gray-500 hover:text-gray-700">
              Work
            </Link>
            <Link href="/info" className="text-gray-500 hover:text-gray-700">
              Info
            </Link>
            <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5] text-white rounded-full px-6">Get Started</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4b3f72]">Inventory Management</h1>
              <p className="text-gray-600">Manage and track your inventory items</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5] text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Item Name</label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="category">Category</label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Footwear">Footwear</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="quantity">Quantity</label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="supplier">Supplier</label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      className="bg-[#6c3ce9] hover:bg-[#5a30c5]"
                      onClick={handleAddItem}
                      disabled={!newItem.name || !newItem.category || !newItem.supplier}
                    >
                      Add Item
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items or suppliers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>{categoryFilter || "All Categories"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Footwear">Footwear</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>{statusFilter || "All Status"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Item Name
                      {sortField === "name" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                    <div className="flex items-center">
                      Category
                      {sortField === "category" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center">
                      Quantity
                      {sortField === "quantity" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...item })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Inventory Item</DialogTitle>
                              </DialogHeader>
                              {editingItem && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <label htmlFor="edit-name">Item Name</label>
                                    <Input
                                      id="edit-name"
                                      value={editingItem.name}
                                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <label htmlFor="edit-category">Category</label>
                                    <Select
                                      value={editingItem.category}
                                      onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Footwear">Footwear</SelectItem>
                                        <SelectItem value="Clothing">Clothing</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <label htmlFor="edit-quantity">Quantity</label>
                                    <Input
                                      id="edit-quantity"
                                      type="number"
                                      min="0"
                                      value={editingItem.quantity}
                                      onChange={(e) =>
                                        setEditingItem({ ...editingItem, quantity: Number.parseInt(e.target.value) })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <label htmlFor="edit-supplier">Supplier</label>
                                    <Input
                                      id="edit-supplier"
                                      value={editingItem.supplier}
                                      onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5]" onClick={handleUpdateItem}>
                                    Update Item
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Are you sure you want to delete "{item.name}"? This action cannot be undone.</p>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                                    Delete
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <footer className="bg-[#4b3f72] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Your Inventory System. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-purple-200">
                Terms
              </Link>
              <Link href="#" className="hover:text-purple-200">
                Privacy
              </Link>
              <Link href="#" className="hover:text-purple-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

