// app/layout.tsx
import '@/styles/globals.css';

export const metadata = {
  title: 'Rehoboth Exchange',
  description: 'Buy cryptocurrencies easily and securely',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-gray-900">
        <header className="bg-primary text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Rehoboth Exchange</h1>
          </div>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-secondary text-white p-4 text-center">
          <div className="container mx-auto">© 2024 Rehoboth Exchange</div>
        </footer>
      </body>
    </html>
  );
}
