'use client';

import { IUser } from '@/models/User';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { Spinner } from '../ui/spinner';

interface UserCardProps {
  user: IUser;
  onSubmit: () => void;
}

function UserCard({ user, onSubmit }: UserCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <form
      key={user.email}
      onSubmit={async e => {
        e.preventDefault();
        setIsLoading(true);
        await onSubmit();
      }}
    >
      <Button
        type="submit"
        variant="outline"
        className="w-full p-3 px-6 cursor-pointer h-auto gap-3 justify-start"
      >
        <Avatar className="h-9 w-9 rounded-full shrink-0 overflow-hidden">
          <AvatarImage
            src={user.profilePicture}
            className="object-cover"
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback>
            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
          </AvatarFallback>
        </Avatar>
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col text-left">
            <div className="font-medium flex gap-2">
              <span>{`${user.firstName} ${user.lastName}`}</span>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            <span className="font-body-sm font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
          {isLoading && <Spinner />}
        </div>
      </Button>
    </form>
  );
}

export default UserCard;
