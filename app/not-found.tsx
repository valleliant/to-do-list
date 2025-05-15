'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">404 - Page non trouvée</h1>
      <p className="mb-6">Nous n'avons pas trouvé la page que vous cherchez.</p>
      <Link href="/" className="bg-apple-blue text-white px-4 py-2 rounded-lg font-medium">
        Retourner à l'accueil
      </Link>
    </div>
  );
} 