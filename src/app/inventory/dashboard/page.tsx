"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Package, AlertTriangle, ShoppingCart, TrendingUp, Users, Calendar } from "lucide-react"

// Sample data for charts
const categoryData = [
  { name: "Footwear", value: 57 },
  { name: "Clothing", value: 42 },
  { name: "Accessories", value: 32 },
  { name: "Electronics", value: 18 },
]

const monthlyData = [
  { name: "Jan", inStock: 65, lowStock: 12, outOfStock: 5 },
  { name: "Feb", inStock: 59, lowStock: 15, outOfStock: 8 },
  { name: "Mar", inStock: 80, lowStock: 10, outOfStock: 2 },
  { name: "Apr", inStock: 81, lowStock: 8, outOfStock: 3 },
  { name: "May", inStock: 56, lowStock: 20, outOfStock: 10 },
  { name: "Jun", inStock: 55, lowStock: 15, outOfStock: 12 },
]

const supplierData = [
  { name: "Nike Inc.", count: 24 },
  { name: "Adidas", count: 18 },
  { name: "Puma", count: 15 },
  { name: "North Face", count: 12 },
  { name: "Ray-Ban", count: 8 },
  { name: "Timberland", count: 7 },
]

const COLORS = ["#6c3ce9", "#ff6b81", "#feca57", "#1dd1a1", "#48dbfb", "#ff9ff3"]

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("last30days")

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
              <h1 className="text-3xl font-bold text-[#4b3f72]">Dashboard</h1>
              <p className="text-gray-600">Overview of your inventory performance</p>
            </div>

            <div className="flex gap-2">
              <Link href="/inventory">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" /> View Inventory
                </Button>
              </Link>
              <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5] text-white">
                <Calendar className="mr-2 h-4 w-4" /> Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <h3 className="text-2xl font-bold">149</h3>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#6c3ce9]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                  <h3 className="text-2xl font-bold">24</h3>
                  <p className="text-xs text-yellow-600 mt-1">+5% from last month</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Orders Pending</p>
                  <h3 className="text-2xl font-bold">18</h3>
                  <p className="text-xs text-blue-600 mt-1">-3% from last month</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
                  <h3 className="text-2xl font-bold">12</h3>
                  <p className="text-xs text-green-600 mt-1">+2 new this month</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inStock" name="In Stock" fill="#6c3ce9" />
                        <Bar dataKey="lowStock" name="Low Stock" fill="#feca57" />
                        <Bar dataKey="outOfStock" name="Out of Stock" fill="#ff6b81" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Items by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers">
              <Card>
                <CardHeader>
                  <CardTitle>Items by Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={supplierData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6c3ce9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Winter Jacket</p>
                        <p className="text-sm text-gray-500">8 items remaining</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Leather Boots</p>
                        <p className="text-sm text-gray-500">12 items remaining</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Sunglasses</p>
                        <p className="text-sm text-gray-500">Out of stock</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Inventory Updated</p>
                      <p className="text-sm text-gray-500">Added 24 new Running Shoes to inventory</p>
                      <p className="text-xs text-gray-400 mt-1">Today, 10:30 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-gray-500">Ordered 50 Baseball Caps from Adidas</p>
                      <p className="text-xs text-gray-400 mt-1">Yesterday, 2:15 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Low Stock Alert</p>
                      <p className="text-sm text-gray-500">Leather Boots inventory below threshold</p>
                      <p className="text-xs text-gray-400 mt-1">Yesterday, 9:45 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

