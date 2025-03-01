"use client"

import { useState } from "react"
import { Search, MoreVertical, Home, Heart, Star, BarChart2, MessageSquare, MapPin, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { InventoryChart } from "./inventory-chart"
import { InventoryTable } from "./inventory-table"
import { CircularProgress } from "./circular-progress"
import { Notifications } from "./notifications"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex h-screen bg-rose-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-16 flex-col items-center py-8 bg-[#2d2a3d] text-white">
        <div className="mb-8">
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-8 mt-8">
          <Button variant="ghost" size="icon" className="text-white">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Heart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Star className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <BarChart2 className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <MapPin className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 bg-muted/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">NAME SURNAME</span>
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Inventory Movement Chart */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Movimiento de Inventario</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <InventoryChart />
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Productos Registrados</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="text-4xl font-bold text-emerald-500 flex items-center">
                2.200.150
                <span className="text-emerald-500 ml-2">↑</span>
              </div>
              <div className="mt-4 mb-4">
                <CircularProgress value={80} color="#e57373" size={120} />
              </div>
              <Button variant="link" className="text-muted-foreground">
                Show all &gt;&gt;
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card className="col-span-1 md:col-span-2 bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Detalle de Inventario</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <InventoryTable />
              <div className="flex gap-2 mt-4">
                <Button className="bg-emerald-500 hover:bg-emerald-600">Agregar Producto</Button>
                <Button variant="destructive">Eliminar Seleccionados</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Notificaciones</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <Notifications />
            </CardContent>
          </Card>

          {/* Stock Level */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Nivel de Stock</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="text-4xl font-bold text-rose-500 flex items-center">
                1.941.000
                <span className="text-rose-500 ml-2">↓</span>
              </div>
              <div className="mt-4 mb-4">
                <CircularProgress value={75} color="#e57373" size={120} />
              </div>
              <Button variant="link" className="text-muted-foreground">
                Show all &gt;&gt;
              </Button>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-[#6d4a5c] text-white">
              <CardTitle>Ganancias</CardTitle>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="text-4xl font-bold text-rose-500 flex items-center">
                12.123$
                <span className="text-rose-500 ml-2">↓</span>
              </div>
              <div className="mt-4 mb-4">
                <CircularProgress value={75} color="#e57373" size={120} />
              </div>
              <Button variant="link" className="text-muted-foreground">
                Show all &gt;&gt;
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

