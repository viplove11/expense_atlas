import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(params.tripId),
      userId: session.user.id
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const expenses = await db.collection('expenses').find({ tripId: params.tripId }).toArray();

    // Calculate analytics
    const totalPlanned = expenses.reduce((sum, exp) => sum + exp.plannedAmount, 0);
    const totalActual = expenses.reduce((sum, exp) => sum + exp.actualAmount, 0);
    const difference = totalActual - totalPlanned;
    const percentage = totalPlanned > 0 ? ((difference / totalPlanned) * 100).toFixed(2) : 0;

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      if (!categoryBreakdown[exp.category]) {
        categoryBreakdown[exp.category] = { planned: 0, actual: 0 };
      }
      categoryBreakdown[exp.category].planned += exp.plannedAmount;
      categoryBreakdown[exp.category].actual += exp.actualAmount;
    });

    // Daily expenses
    const dailyExpenses = {};
    expenses.forEach(exp => {
      const date = exp.date.toISOString().split('T')[0];
      if (!dailyExpenses[date]) dailyExpenses[date] = 0;
      dailyExpenses[date] += exp.actualAmount;
    });

    return NextResponse.json({
      totalPlanned,
      totalActual,
      difference,
      percentage,
      categoryBreakdown,
      dailyExpenses: Object.entries(dailyExpenses).map(([date, amount]) => ({ date, amount }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}