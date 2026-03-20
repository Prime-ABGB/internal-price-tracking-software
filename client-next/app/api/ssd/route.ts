export async function GET() {
  try {
    // Replace this with your actual backend API endpoint
    const response = await fetch('http://localhost:3500/ssd/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch SSD data');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching SSD data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
