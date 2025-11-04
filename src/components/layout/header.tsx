import { NavUser } from '../common/nav-user';
import { ThemeSwitcher } from '../common/theme-switcher';
interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header
      className="h-16 flex justify-between items-center px-6 shadow-2xl rounded-b-4xl
      border-1 border-muted-foreground/30 bg-background"
    >
      {children}
      <div className="w-full flex justify-end items-center gap-3">
        <ThemeSwitcher />
        <NavUser />
      </div>
    </header>
  );
}
