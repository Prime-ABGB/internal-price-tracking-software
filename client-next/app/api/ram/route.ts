export async function GET() {
  try {
    // Replace this with your actual backend API endpoint
    const response = await fetch('http://localhost:3500/ram/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch RAM data');
    }

    const data = await response.json();
    return Response.json(data); 
  } catch (error) {
    console.error('Error fetching RAM data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
