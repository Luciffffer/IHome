import { NavUser } from '../nav-user';

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="h-16 flex justify-between items-center px-6 drop-shadow-md rounded-b-4xl">
      <span className="font-semibold font-body-lg w-full">
        I<span className="font-light">home</span>
      </span>
      {children}
      <div className="w-full flex justify-end">
        <NavUser />
      </div>
    </header>
  );
}
