import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'EXIMIA Journey Composer | Personalized Latvia Experiences',
  description: 'AI composes. Humans validate. The intent-to-reality orchestration platform for authentic Latvia journeys across 7 Routes and 4 Seasons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-slate-800 bg-slate-50 antialiased selection:bg-rose-100 selection:text-rose-900">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
