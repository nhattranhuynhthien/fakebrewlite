import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BrewLite – Đặt Đồ Uống Mobile-first',
  description: 'Hệ thống đặt đồ uống trực tuyến BrewLite',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, backgroundColor: '#f9fafb' }}>{children}</body>
    </html>
  );
}