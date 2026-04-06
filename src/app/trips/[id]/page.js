'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function TripDetail() {
  const { data: session } = useSession();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    plannedAmount: '',
    actualAmount: '',
    date: '',
  });
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    } else {
      fetchTrip();
      fetchExpenses();
      fetchAnalytics();
    }
  }, [session, router]);

  const fetchTrip = async () => {
    const res = await fetch(`/api/trips/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setTrip(data);
    }
  };

  const fetchExpenses = async () => {
    const res = await fetch(`/api/expenses?tripId=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setExpenses(data);
    }
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`/api/analytics/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newExpense,
        tripId: params.id,
        plannedAmount: parseFloat(newExpense.plannedAmount) || 0,
        actualAmount: parseFloat(newExpense.actualAmount) || 0,
      }),
    });

    if (res.ok) {
      setShowAddExpense(false);
      setNewExpense({
        category: '',
        description: '',
        plannedAmount: '',
        actualAmount: '',
        date: '',
      });
      fetchExpenses();
      fetchAnalytics();
      fetchTrip(); // Update trip totals
    }
  };

  if (!session || !trip) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([category, data]) => ({
    category,
    planned: data.planned,
    actual: data.actual,
  })) : [];

  const pieData = analytics ? Object.entries(analytics.categoryBreakdown).map(([category, data]) => ({
    name: category,
    value: data.actual,
  })) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
          <p className="text-gray-600 mb-4">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Planned Budget</p>
              <p className="text-2xl font-bold text-blue-900">${trip.totalPlannedBudget.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Actual Spent</p>
              <p className="text-2xl font-bold text-green-900">${trip.totalActualSpent.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg ${analytics?.difference >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm font-medium ${analytics?.difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                Difference
              </p>
              <p className={`text-2xl font-bold ${analytics?.difference >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                ${analytics?.difference?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Category Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#8884d8" name="Planned" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Spending by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Expenses</h2>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>

          {showAddExpense && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Category"
                  required
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  required
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Planned Amount"
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newExpense.plannedAmount}
                  onChange={(e) => setNewExpense({ ...newExpense, plannedAmount: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Actual Amount"
                  required
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newExpense.actualAmount}
                  onChange={(e) => setNewExpense({ ...newExpense, actualAmount: e.target.value })}
                />
                <input
                  type="date"
                  required
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {expenses.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No expenses yet. Add your first expense above.
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Planned: ${expense.plannedAmount.toFixed(2)}</p>
                      <p className="font-medium text-gray-900">Actual: ${expense.actualAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}