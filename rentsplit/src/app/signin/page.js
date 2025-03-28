'use client'; // Ensure this is a client-side component

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={() => signIn('google')}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Sign in with Google
      </button>
    </div>
  );
}
