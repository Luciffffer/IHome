import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';

async function NavUser({ className }: { className?: string }) {
  const session = await auth();
  const user = session!.user!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex gap-6 items-center ${className}`}>
        <div className="flex gap-3 items-center">
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarImage
              src={user.profilePicture}
              className="object-cover"
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
            </AvatarFallback>
          </Avatar>
          <div className="flex-col items-start hidden md:flex">
            <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
            <span className="font-body-sm truncate font-normal -mt-1">
              {user.email}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="size-4 hidden md:flex" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        sideOffset={16}
      >
        <DropdownMenuLabel>
          <div className="flex gap-3 items-center">
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarImage
                className="object-cover"
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
              <span className="font-body-sm truncate font-normal -mt-1">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href="/api/auth/logout"
              className="flex gap-2 items-center w-full"
            >
              <LogOut />
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { NavUser };
