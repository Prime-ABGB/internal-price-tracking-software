export async function GET() {
  try {
    const response = await fetch('http://localhost:3500/gpu/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GPU data');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching GPU data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
