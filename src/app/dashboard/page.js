'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MapPin, Calendar, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTrips();
    }
  }, [session]);

  const fetchTrips = async () => {
    const res = await fetch('/api/trips');
    const data = await res.json();
    setTrips(data);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/trips/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Trip</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${trips.reduce((sum, trip) => sum + trip.totalPlannedBudget, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trips.filter(trip => new Date(trip.endDate) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Trips</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {trips.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No trips yet. <Link href="/trips/new" className="text-blue-600 hover:text-blue-500">Create your first trip</Link>
              </div>
            ) : (
              trips.map((trip) => (
                <div key={trip._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{trip.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Budget: ${trip.totalPlannedBudget.toFixed(2)} | Spent: ${trip.totalActualSpent.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      href={`/trips/${trip._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </Link>
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