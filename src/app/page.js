import Link from 'next/link';
import { Plane, BarChart3, Wallet, CalendarDays, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(125deg,_#f8fafc_0%,_#e0f2fe_45%,_#eef2ff_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 mb-6">
            <CalendarDays className="h-4 w-4 text-blue-700" />
            Plan Better. Spend Smarter.
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Expense Atlas
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Build trip budgets by date, track actual spend, and instantly see where you are high or low.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-10 sm:mt-14">
          <div className="bg-white/75 backdrop-blur-sm border border-white rounded-2xl p-5 sm:p-8 shadow-xl">
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <Plane className="h-11 w-11 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Trip Planning</h3>
                <p className="text-slate-600">
                  Create trips with date ranges and define pre-calculated expense categories.
                </p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <Wallet className="h-11 w-11 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Expense Tracking</h3>
                <p className="text-slate-600">
                  Capture exact paid amounts date-wise and compare with planned values.
                </p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <BarChart3 className="h-11 w-11 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Analytics</h3>
                <p className="text-slate-600">
                  Monitor category trends and daily differences to keep spending under control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
