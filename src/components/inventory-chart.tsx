"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Ene", entradas: 100, salidas: 240 },
  { name: "Feb", entradas: 200, salidas: 140 },
  { name: "Mar", entradas: 300, salidas: 400 },
  { name: "Abr", entradas: 110, salidas: 280 },
  { name: "May", entradas: 150, salidas: 100 },
  { name: "Jun", entradas: 250, salidas: 300 },
  { name: "Jul", entradas: 180, salidas: 200 },
  { name: "Ago", entradas: 300, salidas: 150 },
]

export function InventoryChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="entradas"
            stroke="#4caf50"
            activeDot={{ r: 8 }}
            dot={{ r: 6, fill: "#4caf50" }}
          />
          <Line
            type="monotone"
            dataKey="salidas"
            stroke="#e57373"
            activeDot={{ r: 8 }}
            dot={{ r: 6, fill: "#e57373" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

