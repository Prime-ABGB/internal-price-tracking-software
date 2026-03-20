"use client";

import { useState } from "react";
import { X } from "lucide-react";

export type ProductCategory = "cpu" | "gpu" | "ram" | "ssd";

export interface AddProductFormData {
  productName: string;
  sku: string;
  primePrice: string;
  category: ProductCategory;
  primeLink: string;
  mdcompLink: string;
  vedantLink: string;
  pcstudioLink: string;
  clarionLink: string;
  ehubsLink: string;
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "cpu", label: "CPU" },
  { value: "gpu", label: "GPU" },
  { value: "ram", label: "RAM" },
  { value: "ssd", label: "SSD" },
];

const initialForm: AddProductFormData = {
  productName: "",
  sku: "",
  primePrice: "",
  category: "cpu",
  primeLink: "",
  mdcompLink: "",
  vedantLink: "",
  pcstudioLink: "",
  clarionLink: "",
  ehubsLink: "",
};

export function AddProductModal({
  open,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [form, setForm] = useState<AddProductFormData>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const primePriceNum = parseFloat(form.primePrice);
    if (!form.productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (isNaN(primePriceNum) || primePriceNum < 0) {
      setError("Please enter a valid prime price.");
      return;
    }
    if (!form.primeLink.trim()) {
      setError("Prime product URL is required for scraping prices.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName.trim(),
          sku: form.sku.trim(),
          primePrice: primePriceNum,
          category: form.category,
          primeLink: form.primeLink.trim(),
          mdcompLink: form.mdcompLink.trim() || undefined,
          vedantLink: form.vedantLink.trim() || undefined,
          pcstudioLink: form.pcstudioLink.trim() || undefined,
          clarionLink: form.clarionLink.trim() || undefined,
          ehubsLink: form.ehubsLink.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to add product");
      }
      setSuccess(true);
      setForm(initialForm);
      setStep(1);
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setForm(initialForm);
      setStep(1);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const validateStep1 = () => {
    const primePriceNum = parseFloat(form.primePrice);
    if (!form.productName.trim()) return "Product name is required.";
    if (!form.sku.trim()) return "SKU is required.";
    if (isNaN(primePriceNum) || primePriceNum < 0)
      return "Please enter a valid prime price.";
    if (!form.primeLink.trim())
      return "Prime product URL is required for scraping prices.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    if (!submitting) {
      setError(null);
      setStep(1);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Add new product</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Step {step} of 2
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full bg-primary transition-all ${
                step === 1 ? "w-1/2" : "w-full"
              }`}
            />
          </div>
        </div>

        <div className="px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="hidden"
          />

          {success ? (
            <p className="py-6 text-center text-green-600">
              Product added. Scraping prices…
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                if (step === 1) {
                  e.preventDefault();
                  handleNext();
                  return;
                }
                handleSubmit(e);
              }}
              className="space-y-4"
            >
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="productName"
                        className="mb-1 block text-sm font-medium"
                      >
                        Product name
                      </label>
                      <input
                        id="productName"
                        name="productName"
                        type="text"
                        value={form.productName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g. Intel Core i5-14400F"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sku"
                        className="mb-1 block text-sm font-medium"
                      >
                        SKU
                      </label>
                      <input
                        id="sku"
                        name="sku"
                        type="text"
                        value={form.sku}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g. BX8071514400F"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="primePrice"
                        className="mb-1 block text-sm font-medium"
                      >
                        Prime price
                      </label>
                      <input
                        id="primePrice"
                        name="primePrice"
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.primePrice}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g. 15232"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="category"
                        className="mb-1 block text-sm font-medium"
                      >
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="primeLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        Prime product URL
                      </label>
                      <input
                        id="primeLink"
                        name="primeLink"
                        type="url"
                        value={form.primeLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://www.primeabgb.com/..."
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Required so we can scrape Prime and other retailer
                        prices.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Retailer product URLs</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Optional. Add whichever links you have and we’ll scrape
                      those sites too.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="mdcompLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        MD Computers URL
                      </label>
                      <input
                        id="mdcompLink"
                        name="mdcompLink"
                        type="url"
                        value={form.mdcompLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://mdcomputers.in/..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="vedantLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        Vedant URL
                      </label>
                      <input
                        id="vedantLink"
                        name="vedantLink"
                        type="url"
                        value={form.vedantLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://www.vedantcomputers.com/..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pcstudioLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        PC Studio URL
                      </label>
                      <input
                        id="pcstudioLink"
                        name="pcstudioLink"
                        type="url"
                        value={form.pcstudioLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://www.pcstudio.in/..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clarionLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        Clarion URL
                      </label>
                      <input
                        id="clarionLink"
                        name="clarionLink"
                        type="url"
                        value={form.clarionLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://shop.clarioncomputers.in/..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ehubsLink"
                        className="mb-1 block text-sm font-medium"
                      >
                        EHub URL
                      </label>
                      <input
                        id="ehubsLink"
                        name="ehubsLink"
                        type="url"
                        value={form.ehubsLink}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://elitehubs.com/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded bg-red-50 p-2 text-sm text-red-800">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {step === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 rounded-md border border-input bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={submitting}
                      className="flex-1 rounded-md border border-input bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submitting ? "Adding & scraping…" : "Add product"}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
