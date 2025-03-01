"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const inventoryData = [
  { id: 1, name: "Laptops HP", quantity: 670 },
  { id: 2, name: "Monitores Dell", quantity: 60 },
  { id: 3, name: "Teclados Mecánicos", quantity: 140 },
  { id: 4, name: "Mouse Inalámbricos", quantity: 312 },
  { id: 5, name: "Auriculares Bluetooth", quantity: 420 },
  { id: 6, name: "Cámaras Web HD", quantity: 600 },
  { id: 7, name: "Cables HDMI", quantity: 88 },
  { id: 8, name: "Discos SSD", quantity: 450 },
]

export function InventoryTable() {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

