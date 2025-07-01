import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LofiFlow',
  description: 'Focused Writing with Lofi Vibes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSJoc2woMTgwIDQwJSA4NyUpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSI+PHBhdGggZD0iTTE3IDhDOCAxMCA1LjUgMTYuNSA1LjUgMTYuNWMwLTIuNSAyLTQuNSAyLTQuNUM1LjUgMTAgMiAxMi41IDIgMTdjMCAyLjUgMi41IDQuNSA1LjUgNC41czUuNS0yIDUuNS00LjVjMC0yLTEtMy41LTIuNS00LjVjMi41LTIuNSAzLjUtMyA2LTQuNWMyLTEgMy0zLjUgMy0zLjVzLTIgMS41LTMuNSAyLjV6IiBmaWxsPSJoc2woMTgwIDU1JSAxMCUpIi8+PC9nPjwvc3ZnPg==" sizes="any" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
