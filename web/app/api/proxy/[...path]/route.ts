import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const url = `${backendUrl}/${path.join('/')}`;

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers),
        'x-user-id': session.user.id, // Pass user ID to backend if needed
        host: new URL(backendUrl).host,
      },
      body,
    });

    const data = await response.blob();
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
export const HEAD = handleRequest;
export const OPTIONS = handleRequest;
