import Link from 'next/link';
import { Plane, BarChart3, Wallet } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Expense Atlas
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plan, track, and analyze your trip expenses with ease. Keep your adventures on budget and within control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-14 sm:mt-20 grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Plane className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trip Planning</h3>
            <p className="text-gray-600">
              Create trips with date ranges and set budgets for different categories.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Wallet className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
            <p className="text-gray-600">
              Track planned vs actual expenses with detailed categorization.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Visualize your spending with charts and get insights on your budget performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
