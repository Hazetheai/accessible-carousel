import type { Metadata } from 'next';
import fonts from '@/fonts';

import config from '@/config';

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
      <body className={fonts}>{children}</body>
    </html>
  );
}
