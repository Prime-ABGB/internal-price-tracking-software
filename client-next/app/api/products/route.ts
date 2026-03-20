import { NextRequest } from "next/server";

const BACKEND = "http://localhost:3500";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      sku,
      primePrice,
      category,
      primeLink,
      mdcompLink,
      vedantLink,
      pcstudioLink,
      clarionLink,
      ehubsLink,
    } = body;

    const validCategories = ["cpu", "gpu", "ram", "ssd"];
    if (
      !validCategories.includes(category) ||
      !productName ||
      !sku ||
      primePrice == null ||
      !primeLink
    ) {
      return Response.json(
        {
          error:
            "Missing or invalid fields: productName, sku, primePrice, category (cpu|gpu|ram|ssd), primeLink are required.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND}/${category}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: String(productName).trim(),
        sku: String(sku).trim(),
        primePrice: Number(primePrice),
        primeLink: String(primeLink).trim(),
        mdcompLink: mdcompLink ? String(mdcompLink).trim() : undefined,
        vedantLink: vedantLink ? String(vedantLink).trim() : undefined,
        pcstudioLink: pcstudioLink ? String(pcstudioLink).trim() : undefined,
        clarionLink: clarionLink ? String(clarionLink).trim() : undefined,
        ehubsLink: ehubsLink ? String(ehubsLink).trim() : undefined,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return Response.json(
        { error: data.error || data.message || "Failed to add product" },
        { status: response.status }
      );
    }
    return Response.json(data);
  } catch (error) {
    console.error("Add product API error:", error);
    return Response.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
