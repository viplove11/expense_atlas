'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MapPin, Calendar, IndianRupee } from 'lucide-react';

function getDateKey(value) {
  return new Date(value).toISOString().split('T')[0];
}

function getVarianceLabel(diff) {
  if (diff > 0) return 'High';
  if (diff < 0) return 'Low';
  return 'On Track';
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [tripExpenses, setTripExpenses] = useState([]);
  const [actualDrafts, setActualDrafts] = useState({});
  const [savingExpenseId, setSavingExpenseId] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchTrips = useCallback(async () => {
    const res = await fetch('/api/trips');
    const data = await res.json();
    setTrips(data);
    if (data.length > 0) {
      setSelectedTripId((previousId) => previousId || data[0]._id);
    }
  }, []);

  const fetchTripExpenses = useCallback(async (tripId) => {
    if (!tripId) return;
    const res = await fetch(`/api/expenses?tripId=${tripId}`);
    if (!res.ok) return;
    const data = await res.json();
    setTripExpenses(data);
    const drafts = data.reduce((acc, expense) => {
      acc[expense._id] = String(expense.actualAmount ?? 0);
      return acc;
    }, {});
    setActualDrafts(drafts);
  }, []);

  useEffect(() => {
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTrips();
    }
  }, [fetchTrips, session]);

  useEffect(() => {
    if (selectedTripId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTripExpenses(selectedTripId);
    }
  }, [fetchTripExpenses, selectedTripId]);

  const expensesByDate = useMemo(() => {
    return tripExpenses.reduce((acc, expense) => {
      const key = getDateKey(expense.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(expense);
      return acc;
    }, {});
  }, [tripExpenses]);

  const sortedDates = useMemo(() => Object.keys(expensesByDate).sort(), [expensesByDate]);
  const selectedDateExpenses = selectedDate ? expensesByDate[selectedDate] || [] : [];
  const selectedTrip = trips.find((trip) => trip._id === selectedTripId);

  useEffect(() => {
    if (sortedDates.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate('');
      return;
    }
    if (!selectedDate || !sortedDates.includes(selectedDate)) {
      setSelectedDate(sortedDates[0]);
    }
  }, [sortedDates, selectedDate]);

  const handleActualAmountChange = (expenseId, value) => {
    setActualDrafts((prev) => ({ ...prev, [expenseId]: value }));
  };

  const saveActualAmount = async (expenseId) => {
    setSavingExpenseId(expenseId);
    const actualAmount = Number(actualDrafts[expenseId]) || 0;
    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseId, actualAmount }),
    });
    if (res.ok) {
      await Promise.all([fetchTrips(), fetchTripExpenses(selectedTripId)]);
    }
    setSavingExpenseId('');
  };

  const selectedDateTotals = selectedDateExpenses.reduce(
    (acc, expense) => {
      const planned = Number(expense.plannedAmount) || 0;
      const actual = Number(actualDrafts[expense._id] ?? expense.actualAmount) || 0;
      acc.planned += planned;
      acc.actual += actual;
      return acc;
    },
    { planned: 0, actual: 0 }
  );

  const selectedDateDiff = selectedDateTotals.actual - selectedDateTotals.planned;

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,_#f8fafc_0%,_#e0f2fe_35%,_#f8fafc_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Planned vs exact spending tracker by date</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Link
              href="/itinerary"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center justify-center shadow-md flex-1 sm:flex-none"
            >
              View Itinerary
            </Link>
            <Link
              href="/trips/new"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 inline-flex items-center justify-center space-x-2 shadow-md flex-1 sm:flex-none"
            >
              <Plus className="h-5 w-5" />
              <span>New Trip</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-white">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-white">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs {trips.reduce((sum, trip) => sum + trip.totalPlannedBudget, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-white">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-cyan-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trips.filter(trip => new Date(trip.endDate) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-xl border border-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-900">
            <h2 className="text-lg font-semibold text-white">Your Trips</h2>
            <p className="text-xs text-slate-200 mt-1">Quick budget health and actions for each trip</p>
          </div>
          <div className="divide-y divide-slate-200">
            {trips.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No trips yet. <Link href="/trips/new" className="text-blue-600 hover:text-blue-500">Create your first trip</Link>
              </div>
            ) : (
              trips.map((trip) => (
                <div key={trip._id} className="px-6 py-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">{trip.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          (trip.totalActualSpent - trip.totalPlannedBudget) > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {(trip.totalActualSpent - trip.totalPlannedBudget) > 0 ? 'Over Budget' : 'Within Budget'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        <div className="rounded-lg bg-slate-100 px-3 py-2">
                          <p className="text-xs text-slate-500">Planned</p>
                          <p className="text-sm font-semibold text-slate-800">Rs {trip.totalPlannedBudget.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-100 px-3 py-2">
                          <p className="text-xs text-slate-500">Spent</p>
                          <p className="text-sm font-semibold text-slate-800">Rs {trip.totalActualSpent.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-100 px-3 py-2">
                          <p className="text-xs text-slate-500">Difference</p>
                          <p className={`text-sm font-semibold ${(trip.totalActualSpent - trip.totalPlannedBudget) > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                            Rs {Math.abs(trip.totalActualSpent - trip.totalPlannedBudget).toFixed(2)} {(trip.totalActualSpent - trip.totalPlannedBudget) > 0 ? 'High' : 'Low'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full ${(trip.totalActualSpent - trip.totalPlannedBudget) > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{
                            width: `${Math.min(
                              100,
                              trip.totalPlannedBudget > 0
                                ? (trip.totalActualSpent / trip.totalPlannedBudget) * 100
                                : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedTripId(trip._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 sm:flex-none ${
                          selectedTripId === trip._id
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                        }`}
                      >
                        Track Daily
                      </button>
                      <Link
                        href={`/trips/${trip._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm flex-1 sm:flex-none text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedTrip && (
          <div className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-white">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-gray-900">Date-wise Expense Tracker: {selectedTrip.name}</h2>
            </div>

            {sortedDates.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No planned expenses found for this trip yet.
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-2 bg-slate-50/70">
                  {sortedDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        selectedDate === date
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {new Date(date).toLocaleDateString()}
                    </button>
                  ))}
                </div>

                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-200">Planned</p>
                      <p className="text-2xl font-bold">Rs {selectedDateTotals.planned.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">Actual</p>
                      <p className="text-2xl font-bold">Rs {selectedDateTotals.actual.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">Difference</p>
                      <p className={`text-2xl font-bold ${selectedDateDiff > 0 ? 'text-red-300' : selectedDateDiff < 0 ? 'text-emerald-300' : 'text-white'}`}>
                        Rs {Math.abs(selectedDateDiff).toFixed(2)} {selectedDateDiff > 0 ? 'High' : selectedDateDiff < 0 ? 'Low' : 'On Track'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-calculated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exact Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {selectedDateExpenses.map((expense) => {
                        const planned = Number(expense.plannedAmount) || 0;
                        const actual = Number(actualDrafts[expense._id] ?? expense.actualAmount) || 0;
                        const diff = actual - planned;
                        const label = getVarianceLabel(diff);

                        return (
                          <tr key={expense._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rs {planned.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={actualDrafts[expense._id] ?? String(expense.actualAmount ?? 0)}
                                onChange={(e) => handleActualAmountChange(expense._id, e.target.value)}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm w-36"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={diff > 0 ? 'text-red-700' : diff < 0 ? 'text-green-700' : 'text-gray-700'}>
                                Rs {Math.abs(diff).toFixed(2)} {label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => saveActualAmount(expense._id)}
                                disabled={savingExpenseId === expense._id}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                              >
                                {savingExpenseId === expense._id ? 'Saving...' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
