import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from './_components/TRPCProvider';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/app/_components/ThemeProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blogity',
  description: 'A full-stack blogging platform ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            {children}
            <Toaster position="top-right" richColors />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

