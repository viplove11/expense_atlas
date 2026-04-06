'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Expense Atlas
          </Link>
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-gray-900">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}