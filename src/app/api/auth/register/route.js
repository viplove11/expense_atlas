import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Registration attempt for:', email);

    const client = await clientPromise;
    const db = client.db();
    console.log('Connected to database for registration');

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await User.hashPassword(password);
    const user = new User({ email, password: hashedPassword, name });

    const result = await db.collection('users').insertOne(user);
    console.log('User created successfully:', result.insertedId);

    return NextResponse.json({ message: 'User created', userId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}