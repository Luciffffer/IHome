import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { FloorProvider } from '@/contexts/floor-context';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <SessionProvider>
          <FloorProvider>{children}</FloorProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
