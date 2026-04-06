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
      _id: new ObjectId(params.id),
      userId: session.user.id
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(params.id), userId: session.user.id },
      { $set: { ...data, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    return NextResponse.json({ message: 'Trip updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trips').deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    return NextResponse.json({ message: 'Trip deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}