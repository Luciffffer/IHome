import { auth } from '@/auth';
import { UnauthorizedError, ForbiddenError } from './errors';

export async function requireAuth() {
  const session = await auth();

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