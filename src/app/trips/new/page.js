'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_CATEGORIES = ['Food', 'Petrol', 'Hotel', 'Car Rent'];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function getDateRange(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function createDefaultRows() {
  return DEFAULT_CATEGORIES.map((category, index) => ({
    id: `default-${category.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    category,
    plannedAmount: '',
    isCustom: false,
  }));
}

export default function NewTrip() {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyPlans, setDailyPlans] = useState({});
  const [error, setError] = useState('');
  const router = useRouter();

  const tripDates = useMemo(() => getDateRange(startDate, endDate), [startDate, endDate]);

  const totalPlannedBudget = useMemo(
    () =>
      Object.values(dailyPlans).reduce((daySum, rows) => {
        const currentDayTotal = rows.reduce((rowSum, row) => rowSum + (Number(row.plannedAmount) || 0), 0);
        return daySum + currentDayTotal;
      }, 0),
    [dailyPlans]
  );

  const syncPlansWithDates = (dates) => {
    setDailyPlans((prev) => {
      const next = {};
      dates.forEach((date) => {
        next[date] = prev[date] || createDefaultRows();
      });
      return next;
    });
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    syncPlansWithDates(getDateRange(value, endDate));
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    syncPlansWithDates(getDateRange(startDate, value));
  };

  const updatePlanRow = (date, rowId, field, value) => {
    setDailyPlans((prev) => ({
      ...prev,
      [date]: (prev[date] || []).map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const addCustomRow = (date) => {
    setDailyPlans((prev) => ({
      ...prev,
      [date]: [
        ...(prev[date] || []),
        {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          category: '',
          plannedAmount: '',
          isCustom: true,
        },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tripDates.length === 0) {
      setError('Please select a valid start and end date.');
      return;
    }

    const initialExpenses = tripDates.flatMap((date) =>
      (dailyPlans[date] || []).filter((row) => row.category.trim()).map((row) => ({
        date,
        category: row.category.trim(),
        description: row.category.trim(),
        plannedAmount: Number(row.plannedAmount) || 0,
        actualAmount: 0,
      }))
    );

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        startDate,
        endDate,
        totalPlannedBudget,
        initialExpenses,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(data.error);
    }
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e2e8f0)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-700 hover:text-blue-600 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-white shadow-xl rounded-2xl p-6 sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create New Trip</h1>
            <p className="text-sm text-slate-600 mt-2">
              Add pre-calculated expenses for each date. You will fill exact paid amounts later on dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Trip Name
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-500 rounded-xl p-5 shadow-lg">
                <p className="text-sm text-blue-100 font-medium">Total Planned Budget</p>
                <p className="text-3xl font-bold text-white">${totalPlannedBudget.toFixed(2)}</p>
                <p className="text-xs text-blue-100 mt-1">Calculated from day-wise category amounts below.</p>
              </div>
            </div>

            {tripDates.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Plan Expenses By Date</h2>
                {tripDates.map((date) => (
                  <div key={date} className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                      <p className="font-semibold text-slate-800">{dateFormatter.format(new Date(date))}</p>
                      <button
                        type="button"
                        onClick={() => addCustomRow(date)}
                        className="inline-flex items-center text-sm text-blue-700 hover:text-blue-600 font-medium"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Other
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(dailyPlans[date] || []).map((row) => (
                        <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Category"
                            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={row.category}
                            onChange={(e) => updatePlanRow(date, row.id, 'category', e.target.value)}
                            readOnly={!row.isCustom}
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Pre-calculated Amount"
                            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={row.plannedAmount}
                            onChange={(e) => updatePlanRow(date, row.id, 'plannedAmount', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 shadow-md w-full sm:w-auto"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
