"use client"; // Mark this as a Client-Side Component

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-900 to-black text-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-8 gap-8 text-center">
        {/* Logo Section */}
        <Image
          src="/rentsplit-logo.png" // Add your RentSplit logo image path here
          alt="RentSplit Logo"
          width={200}
          height={100}
          priority
        />

        {/* Welcome Text */}
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-400">
          Welcome to RentSplit
        </h1>
        <p className="text-lg sm:text-xl mt-4 text-gray-300">
          Manage your rent and expenses seamlessly. Join now and get started!
        </p>

        {/* Google Sign-In Button */}
        <div className="mt-8">
          <button
            onClick={() => signIn("google")}
            className="bg-[#4285F4] hover:bg-[#357ae8] focus:outline-none focus:ring-4 focus:ring-[#4285F4] active:bg-[#357ae8] transition-colors py-3 px-6 rounded-full text-white font-medium flex items-center gap-3 transform hover:scale-105"
          >
            <Image
              src="/google-logo.png" // Use a Google logo or the official Google logo path
              alt="Google Logo"
              width={24}
              height={24}
            />
            Sign in with Google
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="absolute bottom-4 text-center w-full">
        <p className="text-sm text-gray-400">© 2025 RentSplit. All rights reserved.</p>
      </footer>
    </div>
  );
}
