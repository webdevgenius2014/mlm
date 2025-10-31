import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MLM Platform - Binary Tree Referral System',
  description: 'Multi-Level Marketing platform with binary tree structure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
