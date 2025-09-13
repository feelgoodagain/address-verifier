import './globals.css';
import ApolloWrapper from '@/components/ApolloWrapper';
import type { ReactNode } from 'react';
export const metadata = { title: 'Lawpath Address Tools', description: 'Lawpath-styled address verification' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100svh] font-sans">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-brand-600" />
              <span className="text-mint-500 font-semibold tracking-tight">Address Verifier</span>
            </div>
            {/* <nav className="text-sm text-slate-600 flex items-center gap-4">
              <a href="/verify" className="hover:text-slate-900">Verify</a>
            </nav> */}
          </div>
        </header>
        <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700" />
        <main className="mx-auto max-w-5xl px-6 py-10"> <ApolloWrapper>{children}</ApolloWrapper></main>
        <footer className="border-t mt-10 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-slate-500">  Chase Zhao. {new Date().toTimeString()}</div>
        </footer>
      </body>
    </html>
  );
}