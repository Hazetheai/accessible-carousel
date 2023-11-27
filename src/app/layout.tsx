import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import config from '@/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: config.siteName,
  description: 'How to develop an accessible carousel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="no-js" lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
