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
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSJoc2woMTgwIDQwJSA4NyUpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSI+PHBhdGggZD0iTTExIDIwQTcgNyAwIDAgMSA0IDEzSDJhMTAgMTAgMCAwIDAgMTAgMTB6IiBzdHJva2U9ImhzbCgxODAgNTUlIDEwJSkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDJhNyA3IDAgMCAxIDcgN2gyYTEwIDEwIDAgMCAwLTEwLTEweiIgc3Ryb2tlPSJoc2woMTgwIDU1JSAxMCUpIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvZz48L3N2Zz4=" sizes="any" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
