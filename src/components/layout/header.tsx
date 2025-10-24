import { NavUser } from '../nav-user';
interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header
      className="h-16 flex justify-between items-center px-6 shadow-2xl rounded-b-4xl
      border-1 border-muted-foreground/30"
    >
      {children}
      <div className="w-full flex justify-end">
        <NavUser />
      </div>
    </header>
  );
}
