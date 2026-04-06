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
    const trip = new Trip({ ...data, userId: session.user.id });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trips').insertOne(trip);

    return NextResponse.json({ message: 'Trip created', tripId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}