import { LoginForm } from '@/components/login-form';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string | undefined }>;
}) {
  const { error } = await searchParams;

  console.log('Rendering login page with error:', error);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          iHome
        </a>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
              {error === 'CredentialsSignin'
                ? 'Invalid email or password'
                : 'An unknown error occurred'}
            </AlertTitle>
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
