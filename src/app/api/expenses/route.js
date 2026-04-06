import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { Expense } from '@/lib/models/Expense';
import { ObjectId } from 'mongodb';

async function recalculateTripTotals(db, tripId, userId) {
  const expenses = await db.collection('expenses').find({ tripId, userId }).toArray();
  const totals = expenses.reduce(
    (acc, expense) => {
      acc.totalPlanned += Number(expense.plannedAmount) || 0;
      acc.totalActual += Number(expense.actualAmount) || 0;
      return acc;
    },
    { totalPlanned: 0, totalActual: 0 }
  );

  await db.collection('trips').updateOne(
    { _id: new ObjectId(tripId), userId },
    {
      $set: {
        totalPlannedBudget: totals.totalPlanned,
        totalActualSpent: totals.totalActual,
        updatedAt: new Date(),
      },
    }
  );
}

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

    const expenses = await db.collection('expenses').find(query).sort({ date: 1, category: 1 }).toArray();

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

    await recalculateTripTotals(db, data.tripId, session.user.id);

    return NextResponse.json({ message: 'Expense created', expenseId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { expenseId, actualAmount } = data;

    if (!expenseId) {
      return NextResponse.json({ error: 'expenseId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingExpense = await db.collection('expenses').findOne({
      _id: new ObjectId(expenseId),
      userId: session.user.id,
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await db.collection('expenses').updateOne(
      { _id: new ObjectId(expenseId), userId: session.user.id },
      {
        $set: {
          actualAmount: Number(actualAmount) || 0,
          updatedAt: new Date(),
        },
      }
    );

    await recalculateTripTotals(db, existingExpense.tripId, session.user.id);

    return NextResponse.json({ message: 'Expense updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
