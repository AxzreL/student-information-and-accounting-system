import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIAS - College Student Information & Accounting System',
  description: 'Enterprise Student Information and Accounting Management System for Higher Education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
