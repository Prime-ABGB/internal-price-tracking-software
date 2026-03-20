export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sku = searchParams.get('sku');

  if (!sku) {
    return Response.json({ error: 'SKU parameter is required' }, { status: 400 });
  }

  try {
    // Replace this with your actual backend API endpoint
    const response = await fetch(`http://your-backend-api.com/price-history?sku=${sku}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }

    const data = await response.json();
    return Response.json({ data: data });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
