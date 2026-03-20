'use client'

import { useState, Fragment } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => ReactNode
}

interface ProductTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  renderExpandedRow?: (item: T) => ReactNode
}

export function ProductTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  renderExpandedRow,
}: ProductTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        return sortOrder === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    : data

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-left text-sm font-semibold ${
                  col.sortable ? 'cursor-pointer hover:bg-secondary/70' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <div className="text-primary">
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, idx) => {
            const isExpanded = expandedIndex === idx
            const rowKey = (item as any).id ?? idx
            return (
              <Fragment key={rowKey}>
                <tr
                  onClick={() => {
                    onRowClick?.(item)
                    setExpandedIndex(isExpanded ? null : idx)
                  }}
                  className={`border-b border-border transition-colors ${
                    onRowClick || renderExpandedRow
                      ? 'cursor-pointer hover:bg-secondary/30'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key])}
                    </td>
                  ))}
                </tr>
                {renderExpandedRow && isExpanded && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-4 bg-secondary/20">
                      {renderExpandedRow(item)}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  )
}
