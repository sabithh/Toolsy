import type { Metadata } from 'next';
import Script from 'next/script';
import { Bebas_Neue, Barlow_Condensed, Noto_Sans_Malayalam } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  weight: '400',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['600', '700', '900'],
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-noto-ml',
  weight: ['700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vaadaka.vercel.app'),
  title: 'Vaadaka — Rent Anything · Kerala',
  description: 'Browse and rent tools, equipment, and items from trusted owners near you. No buying. No storing. Just renting.',
  icons: {
    icon: '/vaadaka-icon.svg',
    shortcut: '/vaadaka-icon.svg',
    apple: '/vaadaka-icon.svg',
  },
  openGraph: {
    title: 'Vaadaka — Rent Anything · Kerala',
    description: 'Browse and rent tools, equipment, and items from trusted owners near you.',
    siteName: 'Vaadaka',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Vaadaka' }],
  },
  twitter: {
    card: 'summary',
    title: 'Vaadaka — Rent Anything · Kerala',
    description: 'Browse and rent tools, equipment, and items from trusted owners near you.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${barlowCondensed.variable} ${notoSansMalayalam.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              {children}
              <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
