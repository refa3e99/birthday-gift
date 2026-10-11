import type {Metadata} from 'next';
import { Quicksand, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'A Birthday Surprise 🎁',
  description: 'An interactive digital gift and puzzle experience full of love.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${playfair.variable}`}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
