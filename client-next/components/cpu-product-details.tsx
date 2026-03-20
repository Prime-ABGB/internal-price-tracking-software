import { PriceChart } from "@/components/price-chart";
import type { Product } from "@/lib/types";

interface CpuProductDetailsProps {
  product: Product;
}

export function CpuProductDetails({ product }: CpuProductDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">{product.name}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Product Name :
            </div>
            <div className="font-medium">{product.name}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Product SKU :
            </div>
            <div className="font-medium">{product.sku}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Difference :
            </div>
            <div
              className={`font-medium ${product.difference != null && product.difference > 0 ? "text-red-500" : "text-green-500"}`}
            >
              {product.difference}
            </div>
          </div>
        </div>
      </div>

      {product.retailers && product.retailers.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Price at Retailers</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Retailer</th>
                <th className="text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {product.retailers.map((retailer) => (
                <tr key={retailer.name}>
                  <td className="text-left">{retailer.name}</td>
                  <td className="text-left">{retailer.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {product.priceHistory && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Price History</h3>
          <PriceChart data={product.priceHistory} />
        </div>
      )}
    </div>
  );
}
