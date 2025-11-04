import { auth } from '@/auth';
import { UnauthorizedError, ForbiddenError } from './errors';
import { NextRequest } from 'next/server';

export async function requireAuth(request: NextRequest | null = null) {
  const session = await auth();

  if (request) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token === process.env.API_BEARER_TOKEN) {
      return null;
    }
  }

  if (!session?.user?.email) {
    throw new UnauthorizedError();
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session!.user!.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  return session;
}