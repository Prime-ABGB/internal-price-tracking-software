"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductTable, type Column } from "@/components/product-table";
import { ProductFilter } from "@/components/product-filter";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/types";
import { CpuProductDetails } from "@/components/cpu-product-details";
import { AddProductModal } from "@/components/add-product-modal";
import { Download, Plus } from "lucide-react";

export default function CPUPage() {
  const { products: cpuProducts, loading, error, refetch } = useProducts("cpu");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [differenceFilter, setDifferenceFilter] = useState<
    "all" | "gt0" | "lt0"
  >("all");
  const [exporting, setExporting] = useState(false);

  const filteredProducts = useMemo(() => {
    return cpuProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      const diff = product.difference ?? 0;
      const matchesDiff =
        differenceFilter === "all" ||
        (differenceFilter === "gt0" && diff > 0) ||
        (differenceFilter === "lt0" && diff === 0);

      return matchesSearch && matchesPrice && matchesDiff;
    });
  }, [cpuProducts, searchQuery, priceRange, differenceFilter]);

  const handleExportXlsx = async () => {
    if (exporting || filteredProducts.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const rows = filteredProducts.map((p) => ({
        "Product Name": p.name,
        "Product SKU": p.sku ?? "",
        "Price (Prime)": p.price ?? null,
        Difference: p.difference ?? 0,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CPU");

      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      XLSX.writeFile(wb, `cpu_export_${y}-${m}-${d}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "sku",
      label: "Product SKU",
      sortable: true,
      render: (_, item) => item.sku ?? "",
    },
    {
      key: "price",
      label: "Price (Prime)",
      sortable: true,
      render: (_, item) => (
        <span
          className={`inline-block rounded px-2 py-1 text-sm ${
            item.difference != null && item.difference > 0
              ? ""
              : "border border-green-500 bg-green-50 text-green-700"
          }`}
        >
          {item.price}
        </span>
      ),
    },
    {
      key: "difference",
      label: "Difference",
      sortable: true,
      render: (_, item) => (
        <span
          className={`inline-block rounded px-2 py-1 text-sm ${
            item.difference != null && item.difference > 0
              ? "border border-red-500 bg-red-50 text-red-700"
              : ""
          }`}
        >
          {item.difference ?? 0}
        </span>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container py-8 sm:py-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">CPU Price Tracker</h1>
              <p className="mt-2 text-muted-foreground">
                Compare processor prices and specifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportXlsx}
                disabled={loading || exporting || filteredProducts.length === 0}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting…" : "Export to XLSX"}
              </button>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            </div>
          </div>

          <AddProductModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={refetch}
          />

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
                <p className="text-muted-foreground">Loading CPU data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <ProductFilter
                onSearch={setSearchQuery}
                onDifferenceFilterChange={setDifferenceFilter}
              />

              <ProductTable
                columns={columns}
                data={filteredProducts}
                renderExpandedRow={(product: Product) => (
                  <CpuProductDetails product={product} />
                )}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
