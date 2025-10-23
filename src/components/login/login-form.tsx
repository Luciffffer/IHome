import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { UserService } from '@/services/UserService';
import UserCard from './user-card';

export async function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const users = await UserService.findAllUsers();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Log in with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {users.map(user => (
              <UserCard
                key={user.email}
                user={user}
                onSubmit={async () => {
                  'use server';
                  await signIn('credentials', {
                    email: user.email,
                    password: '123456',
                  });
                  redirect('/');
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
