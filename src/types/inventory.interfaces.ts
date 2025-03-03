export interface Product {

   id: string
  _id?: string // ID original del backend
  name: string
  price: number
  category: string
  stock: number
  minStock: number
  lastUpdated: string
  entryDate?: string
  exitDate?: string
  lastStockUpdate: string

}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "entry" | "exit" | "adjustment"
  quantity: number
  reason: string
  date: string
  user: string
}
