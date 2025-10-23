import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    template: '%s | IHome',
    default: 'IHome - Intelligent Home Management',
  },
  description:
    'Manage and monitor your smart home with IHome, the intelligent home management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
