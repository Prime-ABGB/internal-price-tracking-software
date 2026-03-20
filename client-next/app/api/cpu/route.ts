export async function GET() {
  try {
    const response = await fetch('http://localhost:3500/cpu/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CPU data');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching CPU data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
