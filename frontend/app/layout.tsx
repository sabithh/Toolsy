import type { Metadata } from 'next';
import { Orbitron, Exo_2 } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import CustomCursor from '@/components/ui/CustomCursor';



const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-primary',
  weight: ['400', '500', '700', '900'] // Added 900 for extra bold headers
});

export const metadata: Metadata = {
  title: 'Toolsy - Rent Tools, Build Dreams',
  description: 'Access professional-grade tools from trusted local shops. No buying. No storing. Just building.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${exo2.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <CustomCursor />
            <Navbar />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
