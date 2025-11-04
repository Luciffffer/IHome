import { LoginForm } from '@/components/login/login-form';
import { Alert, AlertTitle } from '@/components/ui/alert';
import Logo from '@/components/ui/logo';
import { AlertCircleIcon } from 'lucide-react';

export const metadata = {
  title: 'Login',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 
        bg-repeat bg-center bg-muted"
      style={{
        backgroundImage: 'url(/images/workbench-bg-graphic.svg)',
      }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex gap-2 items-baseline-last justify-center">
          <Logo className="w-9" />
          {/* <span className="font-semibold font-body-lg text-center">
            I<span className="font-light">home</span>
          </span> */}
        </div>
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
