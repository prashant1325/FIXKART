import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, SignOutButton } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import SearchBar from "./components/Searchbar"; // <--- IMPORT THE NEW COMPONENT

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixKart",
  description: "Industrial Supply Catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-800`}>

        <ClerkProvider>
          {/* HEADER */}
          <header className="w-full bg-[#00529b] border-b border-[#00529b] py-3 sticky top-0 z-50 shadow-md">
            <div className="w-full px-4 md:px-6 flex flex-wrap items-center justify-between gap-4">
              
              {/* --- 1. Logo & Nav Links Group --- */}
              <div className="flex items-center gap-6">
                {/* NEW CODE (Transparent) */}
              <Link href="/" className="flex-shrink-0">
                 <img 
                   src="/fixkart-logo2.png" 
                   alt="FixKart" 
                   className="h-8 w-auto object-contain"
                   />
                  </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-white/90">
                  <Link href="/" className="hover:text-white hover:underline transition-all">Home</Link>
                  <Link href="/about" className="hover:text-white hover:underline transition-all">About</Link>
                </nav>
              </div>

              {/* --- 2. Search Bar --- */}
              <div className="order-last md:order-none w-full md:flex-1 max-w-2xl">
                {/* Replaced the old <form> with the new Component */}
                <SearchBar />
              </div>

              {/* --- 3. Auth Buttons --- */}
              <div className="flex items-center gap-3 text-sm font-semibold whitespace-nowrap">
                <SignedOut>
                  <SignInButton>
                    <button className="text-white hover:text-gray-200">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-[#ffc20e] text-black px-3 py-1.5 rounded hover:bg-yellow-500 transition-colors">
                      Sign up
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                  <SignOutButton>
                    <button className="hidden sm:block text-white/80 hover:text-white text-xs ml-2">
                      Sign out
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>

            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="min-h-[calc(100vh-65px)] w-full bg-white">
            <div className="w-full px-4 md:px-6 py-6">
              {children}
            </div>
          </main>

        </ClerkProvider>
      </body>
    </html>
  );
}