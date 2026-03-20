'use client'

interface PriceBadgeProps {
  price: number
  change?: number
}

export function PriceBadge({ price, change }: PriceBadgeProps) {
  const isPositive = change ? change > 0 : undefined

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="font-semibold text-foreground">
        ${price.toFixed(2)}
      </div>
      {change !== undefined && (
        <div
          className={`text-xs font-medium ${
            isPositive ? 'text-danger' : 'text-success'
          }`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  )
}
