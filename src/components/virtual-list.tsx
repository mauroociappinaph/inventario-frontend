"use client"

import React, { useRef, useEffect, useState } from 'react'

interface VirtualListProps {
  height: number
  itemCount: number
  itemSize: number
  renderItem: ({ index, style }: { index: number; style: React.CSSProperties }) => React.ReactNode
  width?: string | number
  overscanCount?: number
}

export function VirtualList({
  height,
  itemCount,
  itemSize,
  renderItem,
  width = '100%',
  overscanCount = 3
}: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const startIndex = Math.max(0, Math.floor(scrollTop / itemSize) - overscanCount)
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + height) / itemSize) + overscanCount
  )

  const items = []
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(
      renderItem({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemSize,
          width: '100%',
          height: itemSize
        }
      })
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: itemCount * itemSize, position: 'relative' }}>
        {items}
      </div>
    </div>
  )
}
