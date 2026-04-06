import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from './mongodb';
import { User } from './models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('Authorize called with:', credentials.email);
          const client = await clientPromise;
          const db = client.db();
          console.log('Connected to database');

          const user = await db.collection('users').findOne({ email: credentials.email });
          console.log('User found:', !!user);

          if (!user) {
            console.log('User not found');
            return null;
          }

          const isValid = await User.comparePassword(credentials.password, user.password);
          console.log('Password valid:', isValid);

          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          console.log('Login successful for:', user.email);
          return { id: user._id.toString(), email: user.email, name: user.name };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
});