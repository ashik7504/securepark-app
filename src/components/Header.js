// src/components/Header.js
import Link from 'next/link';
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">SecurePark</Link>
      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-indigo-300">
              Dashboard
            </Link>
            <Link href="/listings/create" className="text-sm font-medium hover:text-indigo-300">
              List Your Space
            </Link>
            <span className="text-sm">Hello, {user.email}</span>
            <form action={logout}>
              <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm">
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link href="/auth" className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm">
            Login / Sign Up
          </Link>
        )}
      </nav>
    </header>
  );
}