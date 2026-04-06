import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { Expense } from '@/lib/models/Expense';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    const client = await clientPromise;
    const db = client.db();

    const query = { userId: session.user.id };
    if (tripId) query.tripId = tripId;

    const expenses = await db.collection('expenses').find(query).toArray();

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const expense = new Expense({ ...data, userId: session.user.id });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('expenses').insertOne(expense);

    // Update trip's totalActualSpent
    const expenses = await db.collection('expenses').find({ tripId: data.tripId }).toArray();
    const totalActual = expenses.reduce((sum, exp) => sum + exp.actualAmount, 0);
    await db.collection('trips').updateOne(
      { _id: new ObjectId(data.tripId) },
      { $set: { totalActualSpent: totalActual } }
    );

    return NextResponse.json({ message: 'Expense created', expenseId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}