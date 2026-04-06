import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { Trip } from '@/lib/models/Trip';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const trips = await db.collection('trips').find({ userId: session.user.id }).toArray();

    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const initialExpenses = Array.isArray(data.initialExpenses) ? data.initialExpenses : [];
    const calculatedPlannedBudget = initialExpenses.reduce(
      (sum, expense) => sum + (Number(expense.plannedAmount) || 0),
      0
    );

    const trip = new Trip({
      ...data,
      userId: session.user.id,
      totalPlannedBudget: calculatedPlannedBudget || Number(data.totalPlannedBudget) || 0,
    });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trips').insertOne(trip);

    if (initialExpenses.length > 0) {
      const tripId = result.insertedId.toString();
      const normalizedExpenses = initialExpenses.map((expense) => ({
        tripId,
        userId: session.user.id,
        category: expense.category,
        description: expense.description || expense.category,
        plannedAmount: Number(expense.plannedAmount) || 0,
        actualAmount: Number(expense.actualAmount) || 0,
        date: new Date(expense.date),
        createdAt: new Date(),
      }));

      await db.collection('expenses').insertMany(normalizedExpenses);
    }

    return NextResponse.json({ message: 'Trip created', tripId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
