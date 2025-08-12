
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { LanguageProvider } from '@/context/language-provider';
import { ProgressProvider } from '@/context/progress-provider';
import { getSession } from '@/lib/firebase/auth';
import { SessionProvider } from '@/context/session-provider';


export const metadata: Metadata = {
  title: 'AppMeditacion',
  description: 'A serene interface for guided meditation and habit tracking.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SessionProvider value={session}>
              <ProgressProvider>
                {children}
                <Toaster />
              </ProgressProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
