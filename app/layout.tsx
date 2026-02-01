/**
 * Root Layout
 * Sets up the application structure, metadata, and global styles
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

/**
 * SEO Metadata for the application
 * Includes Open Graph and Twitter Card information for social sharing
 */
export const metadata: Metadata = {
  title: {
    default: 'Irish Health Insurance Chooser - Find Your Perfect Plan',
    template: '%s | Irish Health Insurance Chooser',
  },
  description:
    'Compare Irish health insurance plans from VHI, Laya Healthcare, Irish Life Health, and Level Health. Get personalized recommendations based on your needs and budget.',
  keywords: [
    'Irish health insurance',
    'health insurance comparison',
    'VHI',
    'Laya Healthcare',
    'Irish Life Health',
    'Level Health',
    'private health insurance Ireland',
  ],
  authors: [{ name: 'Irish Health Insurance Chooser' }],
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://irish-health-insurance.vercel.app',
    siteName: 'Irish Health Insurance Chooser',
    title: 'Irish Health Insurance Chooser - Find Your Perfect Plan',
    description:
      'Compare Irish health insurance plans and get personalized recommendations based on your needs and budget.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Irish Health Insurance Chooser',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Irish Health Insurance Chooser',
    description:
      'Compare Irish health insurance plans and get personalized recommendations.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
